/**
 * Unit Tests for bookingService.js
 * Tests: Seat availability, Queue logic, Cancellation with promotion
 */

// Mock Prisma
jest.mock('../src/config/prisma', () => ({
    booking: {
        count: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
    }
}));

// Mock Train model
jest.mock('../src/models/Train', () => ({
    findById: jest.fn()
}));

const prisma = require('../src/config/prisma');
const Train = require('../src/models/Train');
const { createBooking, cancelBooking, getUserBookings } = require('../src/services/bookingService');

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── CREATE BOOKING ─────────────────────────────────────────────

describe('createBooking', () => {

    const bookingInput = {
        userId: 1,
        trainId: 'train123',
        passengerName: 'Sujal',
        age: 22,
        date: '2026-05-25'
    };

    it('should CONFIRM booking when seats are available', async () => {
        const mockTrain = { availableSeats: 5, save: jest.fn() };
        Train.findById.mockResolvedValue(mockTrain);

        const createdBooking = { id: 1, ...bookingInput, status: 'CONFIRMED', queuePosition: null };
        prisma.booking.create.mockResolvedValue(createdBooking);

        const result = await createBooking(bookingInput);

        expect(Train.findById).toHaveBeenCalledWith('train123');
        expect(mockTrain.availableSeats).toBe(4); // decremented
        expect(mockTrain.save).toHaveBeenCalled();
        expect(prisma.booking.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ status: 'CONFIRMED', queuePosition: null })
        });
        expect(result.status).toBe('CONFIRMED');
    });

    it('should set WAITING status when no seats available', async () => {
        const mockTrain = { availableSeats: 0, save: jest.fn() };
        Train.findById.mockResolvedValue(mockTrain);
        prisma.booking.count.mockResolvedValue(2); // 2 already waiting

        const createdBooking = { id: 2, ...bookingInput, status: 'WAITING', queuePosition: 3 };
        prisma.booking.create.mockResolvedValue(createdBooking);

        const result = await createBooking(bookingInput);

        expect(mockTrain.save).not.toHaveBeenCalled(); // seats not touched
        expect(prisma.booking.count).toHaveBeenCalledWith({
            where: { trainId: 'train123', status: 'WAITING' }
        });
        expect(prisma.booking.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ status: 'WAITING', queuePosition: 3 })
        });
        expect(result.status).toBe('WAITING');
        expect(result.queuePosition).toBe(3);
    });

    it('should throw 404 when train is not found', async () => {
        Train.findById.mockResolvedValue(null);

        await expect(createBooking(bookingInput)).rejects.toThrow('Train not found');

        try {
            await createBooking(bookingInput);
        } catch (err) {
            expect(err.statusCode).toBe(404);
        }
    });
});

// ─── CANCEL BOOKING ─────────────────────────────────────────────

describe('cancelBooking', () => {

    it('should throw 404 when booking is not found', async () => {
        prisma.booking.findFirst.mockResolvedValue(null);

        await expect(
            cancelBooking({ bookingId: 99, userId: 1 })
        ).rejects.toThrow('Booking not found or not authorized');
    });

    it('should promote next WAITING booking to CONFIRMED on cancel', async () => {
        const confirmedBooking = {
            id: 1, trainId: 'train123', status: 'CONFIRMED', userId: 1
        };
        const waitingBooking = {
            id: 2, trainId: 'train123', status: 'WAITING', queuePosition: 1
        };

        prisma.booking.findFirst
            .mockResolvedValueOnce(confirmedBooking)   // find the booking to cancel
            .mockResolvedValueOnce(waitingBooking);      // find next waiting

        prisma.booking.delete.mockResolvedValue({});
        prisma.booking.update.mockResolvedValue({});
        prisma.booking.findMany.mockResolvedValue([]); // no more waiting after promotion

        const mockTrain = { availableSeats: 0, save: jest.fn() };
        Train.findById.mockResolvedValue(mockTrain);

        await cancelBooking({ bookingId: 1, userId: 1 });

        // Booking deleted
        expect(prisma.booking.delete).toHaveBeenCalledWith({ where: { id: 1 } });

        // Seat restored then consumed by promoted booking → net 0
        expect(mockTrain.availableSeats).toBe(0);

        // Waiting booking promoted to CONFIRMED
        expect(prisma.booking.update).toHaveBeenCalledWith({
            where: { id: 2 },
            data: { status: 'CONFIRMED', queuePosition: null }
        });

        expect(mockTrain.save).toHaveBeenCalled();
    });

    it('should re-index queue positions after cancellation', async () => {
        const confirmedBooking = {
            id: 1, trainId: 'train123', status: 'CONFIRMED', userId: 1
        };

        prisma.booking.findFirst
            .mockResolvedValueOnce(confirmedBooking) // booking to cancel
            .mockResolvedValueOnce(null);              // no waiting to promote

        prisma.booking.delete.mockResolvedValue({});

        // Two remaining WAITING bookings need re-indexing
        const remainingWaiting = [
            { id: 5, queuePosition: 3 },
            { id: 8, queuePosition: 5 }
        ];
        prisma.booking.findMany.mockResolvedValue(remainingWaiting);
        prisma.booking.update.mockResolvedValue({});

        const mockTrain = { availableSeats: 0, save: jest.fn() };
        Train.findById.mockResolvedValue(mockTrain);

        await cancelBooking({ bookingId: 1, userId: 1 });

        // Queue re-indexed to 1, 2
        expect(prisma.booking.update).toHaveBeenCalledWith({
            where: { id: 5 }, data: { queuePosition: 1 }
        });
        expect(prisma.booking.update).toHaveBeenCalledWith({
            where: { id: 8 }, data: { queuePosition: 2 }
        });
    });
});

// ─── GET USER BOOKINGS ──────────────────────────────────────────

describe('getUserBookings', () => {

    it('should return all bookings for a given user', async () => {
        const mockBookings = [
            { id: 1, userId: 1, passengerName: 'Sujal', status: 'CONFIRMED' },
            { id: 2, userId: 1, passengerName: 'Sujal', status: 'WAITING' }
        ];
        prisma.booking.findMany.mockResolvedValue(mockBookings);

        const result = await getUserBookings(1);

        expect(prisma.booking.findMany).toHaveBeenCalledWith({
            where: { userId: 1 }
        });
        expect(result).toEqual(mockBookings);
        expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no bookings', async () => {
        prisma.booking.findMany.mockResolvedValue([]);

        const result = await getUserBookings(999);

        expect(result).toEqual([]);
    });
});
