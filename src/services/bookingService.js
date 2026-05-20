const prisma = require("../config/prisma");
const Train = require("../models/Train");

// Create Booking
const createBooking = async ({ userId, trainId, passengerName, age, date }) => {

    const train = await Train.findById(trainId);

    if (!train) {
        const err = new Error("Train not found");
        err.statusCode = 404;
        throw err;
    }

    let status = "CONFIRMED";
    let queuePosition = null;

    if (train.availableSeats > 0) {
        train.availableSeats -= 1;
        await train.save();
    } else {
        status = "WAITING";

        const waitingCount = await prisma.booking.count({
            where: {
                trainId,
                status: "WAITING"
            }
        });

        queuePosition = waitingCount + 1;
    }

    const booking = await prisma.booking.create({
        data: {
            userId: Number(userId),
            trainId,
            passengerName,
            age,
            date,
            status,
            queuePosition
        }
    });

    return booking;
};

// Cancel Booking
const cancelBooking = async ({ bookingId, userId }) => {

    const booking = await prisma.booking.findFirst({
        where: {
            id: Number(bookingId),
            userId: Number(userId)
        }
    });

    if (!booking) {
        const err = new Error("Booking not found or not authorized");
        err.statusCode = 404;
        throw err;
    }

    await prisma.booking.delete({
        where: {
            id: Number(bookingId)
        }
    });

    const train = await Train.findById(booking.trainId);

    if (!train) {
        const err = new Error("Train associated with this booking no longer exists");
        err.statusCode = 404;
        throw err;
    }

    if (booking.status === "CONFIRMED") {

        train.availableSeats += 1;

        const nextBooking = await prisma.booking.findFirst({
            where: {
                trainId: booking.trainId,
                status: "WAITING"
            },
            orderBy: {
                queuePosition: "asc"
            }
        });

        if (nextBooking) {

            await prisma.booking.update({
                where: {
                    id: nextBooking.id
                },
                data: {
                    status: "CONFIRMED",
                    queuePosition: null
                }
            });

            train.availableSeats -= 1;
        }
    }

    const waitingBookings = await prisma.booking.findMany({
        where: {
            trainId: booking.trainId,
            status: "WAITING"
        },
        orderBy: {
            queuePosition: "asc"
        }
    });

    for (let i = 0; i < waitingBookings.length; i++) {

        await prisma.booking.update({
            where: {
                id: waitingBookings[i].id
            },
            data: {
                queuePosition: i + 1
            }
        });
    }

    await train.save();

    return booking;
};

// Get User Bookings
const getUserBookings = async (userId) => {

    return await prisma.booking.findMany({
        where: {
            userId: Number(userId)
        }
    });
};

module.exports = {
    createBooking,
    cancelBooking,
    getUserBookings
};