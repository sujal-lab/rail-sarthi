/* ================================================================
   Rail-Sarthi — index.js
   Refactored: Home searches redirect to Tickets tab.
   All booking happens inside the Train Tickets tab.
   Admin & Bookings logic unchanged.
   ================================================================ */

tailwind.config = {
    theme: {
        extend: {
            fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'], heading: ['"Outfit"', 'sans-serif'] },
            colors: {
                ryblue: { 50:'#eef2f9', 100:'#d5def0', 500:'#173873', 600:'#122c5a', 700:'#0e2246', 900:'#071123' },
                ryred:  { 50:'#fef2f3', 100:'#fce5e8', 500:'#d63447', 600:'#c02e3f' }
            },
            boxShadow: {
                glass: '0 8px 32px 0 rgba(31,38,135,0.07)',
                float: '0 20px 40px -10px rgba(0,0,0,0.1)',
                card:  '0 4px 20px -2px rgba(0,0,0,0.05)'
            }
        }
    }
};

/* ── Helpers ─────────────────────────────────────────────────── */
const API_BASE = '';
const $ = id => document.getElementById(id);

const uiData = {
    features: [
        { icon: "bank-cards.png",        title: "Safe Payments",  desc: "100% secure booking experience.",       bg: "ryblue" },
        { icon: "customer-support.png",   title: "Har Pal Support",desc: "Live help 7 days a week.",              bg: "ryred",    cls: "lg:mt-6" },
        { icon: "money-bag.png",          title: "Turant Refunds", desc: "Get money back instantly.",             bg: "emerald" },
        { icon: "train.png",              title: "Live Tracking",  desc: "Track your train's live location.",     bg: "purple",   cls: "lg:mt-6" }
    ],
    faqs: [
        { q: "Is Rail-Sarthi free to use?",    a: "Haan ji! Browsing is free. Fees apply only on booking." },
        { q: "Mera data kitna safe hai?",       a: "We use bank-level encryption. Details are strictly confidential." },
        { q: "Can I cancel my ticket online?",  a: "Bilkul! Cancel easily via 'My Bookings' for auto-refunds." }
    ],
    footer: [
        { t: "Features", l: ["Live Status", "PNR Status", "Time Table", "Seat Info"] },
        { t: "Book",     l: ["Bus Tickets", "Train Tickets", "Food"] },
        { t: "Info",     l: ["About Us", "Contact Us", "FAQs"] }
    ],
    mock: { trains: [], bookings: [] }
};

/* ── Static content injection ────────────────────────────────── */
$('featuresGrid').innerHTML = uiData.features.map(f => `
    <div class="group p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-float transition-all ${f.cls || ''}">
        <div class="w-16 h-16 rounded-2xl bg-${f.bg}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition">
            <img src="https://img.icons8.com/color/96/${f.icon}" class="w-10 h-10">
        </div>
        <h3 class="font-heading font-bold text-xl mb-2">${f.title}</h3>
        <p class="text-sm text-slate-500">${f.desc}</p>
    </div>
`).join('');

$('faqContainer').innerHTML = uiData.faqs.map(f => `
    <div class="bg-white rounded-2xl p-6 cursor-pointer border-2 border-transparent hover:border-ryblue-100 shadow-sm transition"
         onclick="this.lastElementChild.classList.toggle('hidden');this.querySelector('i').classList.toggle('ph-minus')">
        <div class="flex justify-between items-center font-heading font-bold text-lg">
            ${f.q}
            <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-ryblue-600 shrink-0">
                <i class="ph-bold ph-plus"></i>
            </div>
        </div>
        <div class="text-slate-600 mt-4 text-sm hidden font-medium border-t border-slate-100 pt-4">${f.a}</div>
    </div>
`).join('');

$('footerLinks').innerHTML = uiData.footer.map(f => `
    <div>
        <h4 class="font-heading font-bold mb-6 text-xl">${f.t}</h4>
        <ul class="space-y-4 text-sm text-slate-500 font-medium">
            ${f.l.map(i => `<li><a href="#" class="hover:text-ryred-500 transition">${i}</a></li>`).join('')}
        </ul>
    </div>
`).join('') + `
    <div class="col-span-2 lg:border-l lg:border-slate-100 lg:pl-12">
        <div class="font-heading font-black text-2xl mb-4">RAIL सारथी</div>
        <p class="text-sm text-slate-500 mb-6 font-medium">One-stop solution for travel discovery. Safar aapka, saarthi hum.</p>
        <p class="text-sm font-bold">Rail-Sarthi Tech Pvt Ltd</p>
    </div>`;

/* ── Toast notifications ─────────────────────────────────────── */
const showToast = (msg, type = 'success') => {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="ph-bold ${type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'} text-2xl"></i><span>${msg}</span>`;
    $('toast-container').appendChild(t);
    setTimeout(() => {
        t.classList.add('fade-out');
        setTimeout(() => t.remove(), 300);
    }, 3000);
};

/* ── Tab navigation ──────────────────────────────────────────── */
const switchTab = id => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('text-ryblue-600', 'font-bold');
        b.classList.add('text-slate-500');
    });

    const selectedTab = document.getElementById(id);
    if (!selectedTab) return;
    selectedTab.classList.add('active');

    const btn = document.querySelector(`[data-tab="${id}"]`);
    if (btn) {
        btn.classList.remove('text-slate-500');
        btn.classList.add('text-ryblue-600', 'font-bold');
    }

    if (id === 'bookings') fetchBookings();
    if (id === 'admin')    fetchTrains();
};

/* ── API wrapper ─────────────────────────────────────────────── */
const apiCall = async (url, method = 'GET', body = null) => {
    try {
        const r = await fetch(API_BASE + url, {
            method,
            headers: body ? { 'Content-Type': 'application/json' } : {},
            body: body ? JSON.stringify(body) : null
        });
        if (!r.ok) {
            const errData = await r.json().catch(() => ({}));
            return method === 'GET' ? false : (errData.message || `Server Error ${r.status}`);
        }
        return method === 'GET' ? await r.json() : true;
    } catch (err) {
        return method === 'GET' ? false : 'Server offline';
    }
};

/* ── Time formatter ──────────────────────────────────────────── */
const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
};

/* ================================================================
   HOME PAGE — Search only; redirect to Tickets tab
   ================================================================ */

$('homeSearchForm').onsubmit = async (e) => {
    e.preventDefault();

    // Mirror values into the Tickets tab search fields
    $('ticketFrom').value = $('homeFrom').value;
    $('ticketTo').value   = $('homeTo').value;
    $('ticketDate').value = $('homeDate').value;

    // Switch to Tickets tab
    switchTab('tickets');

    // Auto-trigger the search on the Tickets tab
    $('ticketSearchForm').dispatchEvent(new Event('submit'));
};

/* ================================================================
   TRAIN TICKETS TAB
   ================================================================ */

/* Booking state shared across the tickets page */
let ticketState = {
    date:      null,
    trainId:   null,
    trainInfo: null
};

/* ── Show / hide sub-sections inside the Tickets tab ─────────── */
const showTicketResults = () => {
    $('ticketSearchSection').classList.remove('hidden');
    $('ticketBookingSection').classList.add('hidden');
    // Scroll back to top of results
    $('ticketResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const showBookingForm = () => {
    $('ticketBookingSection').classList.remove('hidden');
    $('ticketSearchSection').classList.add('hidden');
    // Scroll to booking form
    $('ticketBookingSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ── Train search ────────────────────────────────────────────── */
$('ticketSearchForm').onsubmit = async (e) => {
    e.preventDefault();

    const from = $('ticketFrom').value.toLowerCase().trim();
    const to   = $('ticketTo').value.toLowerCase().trim();
    const date = $('ticketDate').value;

    ticketState.date = date;

    // Show loading state in results
    $('ticketResults').innerHTML = `
        <div class="text-center py-16">
            <div class="inline-block w-10 h-10 border-4 border-ryblue-100 border-t-ryblue-600 rounded-full animate-spin mb-4"></div>
            <p class="font-bold text-slate-400">Searching trains...</p>
        </div>`;

    const allTrains = await apiCall('/trains') || uiData.mock.trains;

    const filtered = allTrains.filter(t =>
        t.source.toLowerCase().includes(from) &&
        t.destination.toLowerCase().includes(to)
    );

    renderTrainResults(filtered, from, to, date);
};

/* ── Render train result cards ───────────────────────────────── */
const renderTrainResults = (trains, from, to, date) => {
    if (!trains.length) {
        $('ticketResults').innerHTML = `
            <div class="text-center py-16 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <div class="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <i class="ph-bold ph-train text-4xl text-slate-300"></i>
                </div>
                <p class="font-heading font-black text-xl text-slate-500">No trains found</p>
                <p class="text-sm text-slate-400 mt-2 font-medium">Try different cities or check the spelling.</p>
            </div>`;
        return;
    }

    // Results header
    const headerHtml = `
        <div class="flex items-center justify-between mb-5">
            <div>
                <span class="font-heading font-black text-lg text-slate-800">
                    ${trains.length} Train${trains.length > 1 ? 's' : ''} Found
                </span>
                <span class="ml-3 text-sm text-slate-400 font-medium">
                    ${$('ticketFrom').value} → ${$('ticketTo').value} &nbsp;·&nbsp; ${date || ''}
                </span>
            </div>
        </div>`;

    const cardsHtml = trains.map(t => {
        // Calculate duration roughly if both times exist
        let durationBadge = '';
        if (t.dep && t.arr) {
            const [dh, dm] = t.dep.split(':').map(Number);
            const [ah, am] = t.arr.split(':').map(Number);
            let mins = (ah * 60 + am) - (dh * 60 + dm);
            if (mins < 0) mins += 1440;
            const hrs = Math.floor(mins / 60);
            const rem = mins % 60;
            durationBadge = `<span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">${hrs}h ${rem}m</span>`;
        }

        const seatsColor = t.totalSeats > 50 ? 'text-emerald-600' :
                           t.totalSeats > 20 ? 'text-amber-500'  : 'text-ryred-500';

        return `
        <div class="bg-white border border-slate-100 rounded-[1.5rem] p-6 hover:shadow-float transition-all duration-300 group">
            <!-- Train header -->
            <div class="flex justify-between items-start mb-5">
                <div>
                    <div class="font-heading font-black text-lg text-slate-800">${t.trainName}</div>
                    <div class="text-xs text-slate-400 font-bold mt-0.5">${t.trainNo}</div>
                </div>
                <div class="text-right">
                    <div class="font-heading font-black text-2xl text-emerald-600">₹${t.price}</div>
                    <div class="text-xs ${seatsColor} font-bold">${t.totalSeats} seats avail.</div>
                </div>
            </div>

            <!-- Route timeline -->
            <div class="flex items-center gap-3 mb-6">
                <div class="text-center">
                    <div class="font-heading font-black text-xl text-slate-800">${formatTime(t.dep)}</div>
                    <div class="text-xs text-slate-400 font-medium mt-0.5">${t.source}</div>
                </div>
                <div class="flex-1 flex flex-col items-center gap-1">
                    ${durationBadge}
                    <div class="w-full flex items-center gap-1">
                        <div class="w-2 h-2 rounded-full bg-ryblue-600 shrink-0"></div>
                        <div class="flex-1 h-0.5 bg-gradient-to-r from-ryblue-200 to-ryred-200 relative">
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-ryblue-300 bg-white"></div>
                        </div>
                        <div class="w-2 h-2 rounded-full bg-ryred-500 shrink-0"></div>
                    </div>
                </div>
                <div class="text-center">
                    <div class="font-heading font-black text-xl text-slate-800">${formatTime(t.arr)}</div>
                    <div class="text-xs text-slate-400 font-medium mt-0.5">${t.destination}</div>
                </div>
            </div>

            <!-- CTA -->
            <button
                onclick="selectTrain('${t.id}')"
                class="w-full bg-ryblue-900 hover:bg-ryred-500 text-white font-heading font-bold py-3.5 rounded-2xl transition-all duration-300 group-hover:shadow-md flex items-center justify-center gap-2">
                Select &amp; Book
                <i class="ph-bold ph-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </button>
        </div>`;
    }).join('');

    $('ticketResults').innerHTML = headerHtml + `<div class="grid grid-cols-1 md:grid-cols-2 gap-5">${cardsHtml}</div>`;
};

/* ── User clicks "Select & Book" on a train card ─────────────── */
window.selectTrain = async (id) => {
    ticketState.trainId = id;

    // Fetch full train list to find the selected train
    const allTrains = await apiCall('/trains') || uiData.mock.trains;
    const train = allTrains.find(t => t.id === id);
    if (!train) { showToast('Train not found. Please refresh.', 'error'); return; }

    ticketState.trainInfo = train;

    // Populate the selected train summary sidebar
    $('selectedTrainSummary').innerHTML = `
        <div class="text-center pb-4 border-b border-slate-100">
            <div class="font-heading font-black text-xl text-slate-800">${train.trainName}</div>
            <div class="text-xs text-slate-400 font-bold mt-1">${train.trainNo}</div>
        </div>

        <div class="flex justify-between items-center pt-2">
            <div class="text-center">
                <div class="font-black text-lg text-slate-800">${formatTime(train.dep)}</div>
                <div class="text-xs text-slate-400 font-medium">${train.source}</div>
            </div>
            <div class="flex-1 px-3">
                <div class="w-full h-0.5 bg-gradient-to-r from-ryblue-200 to-ryred-200 relative">
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-ryblue-300 bg-white"></div>
                </div>
            </div>
            <div class="text-center">
                <div class="font-black text-lg text-slate-800">${formatTime(train.arr)}</div>
                <div class="text-xs text-slate-400 font-medium">${train.destination}</div>
            </div>
        </div>

        <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
            <div class="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Total Fare</div>
            <div class="font-heading font-black text-3xl text-emerald-600">₹${train.price}</div>
            <div class="text-xs text-emerald-600 font-medium mt-1">per passenger</div>
        </div>

        <div class="text-xs text-slate-400 font-medium space-y-1.5 border-t border-slate-100 pt-3">
            <div class="flex justify-between">
                <span>Date</span>
                <span class="font-bold text-slate-600">${ticketState.date || 'Not set'}</span>
            </div>
            <div class="flex justify-between">
                <span>Available Seats</span>
                <span class="font-bold text-slate-600">${train.totalSeats}</span>
            </div>
        </div>
    `;

    // Populate fare in the booking form
    $('fareDisplay').textContent    = `₹${train.price}`;
    $('totalFareDisplay').textContent = `₹${train.price}`;

    // Reset the booking form fields
    $('passengerName').value = '';
    $('passengerAge').value  = '';

    // Slide to booking form
    showBookingForm();
};

/* ── Confirm booking ─────────────────────────────────────────── */
$('ticketBookingForm').onsubmit = async (e) => {
    e.preventDefault();

    if (!ticketState.trainId) {
        showToast('Please select a train first.', 'error');
        return;
    }

    const payload = {
        trainId:       ticketState.trainId,
        passengerName: $('passengerName').value.trim(),
        age:           parseInt($('passengerAge').value),
        date:          ticketState.date
    };

    const submitBtn = $('ticketBookingForm').querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="ph-bold ph-circle-notch animate-spin text-xl"></i> Booking...`;

    const result = await apiCall('/bookings', 'POST', payload);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    if (result === true) {
        showToast('🎉 Booking confirmed! Check My Bookings.', 'success');
        // Reset and go back to search
        ticketState = { date: null, trainId: null, trainInfo: null };
        $('ticketBookingForm').reset();
        showTicketResults();
    } else {
        showToast(typeof result === 'string' ? result : 'Booking failed. Please try again.', 'error');
    }
};

/* ================================================================
   ADMIN — unchanged logic
   ================================================================ */

const fetchTrains = async () => renderAdminTrains(await apiCall('/trains') || uiData.mock.trains);

const renderAdminTrains = trains => {
    $('adminTrainsTableBody').innerHTML = trains.length
        ? trains.map(x => `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="p-6 font-bold text-slate-800">${x.trainName}</td>
                <td class="p-6 text-slate-500">${x.source} → ${x.destination}</td>
                <td class="p-6 font-bold text-emerald-600">₹${x.price}</td>
                <td class="p-6 text-right">
                    <button onclick="deleteTrain('${x.id}')"
                        class="text-xs font-bold text-ryred-500 hover:text-ryred-600 bg-ryred-50 hover:bg-ryred-100 px-4 py-2 rounded-xl transition-colors">
                        Delete
                    </button>
                </td>
            </tr>`).join('')
        : `<tr><td colspan="4" class="p-16 text-center font-bold text-slate-400">No trains added yet.</td></tr>`;
};

window.deleteTrain = async id => {
    if (confirm('Delete this train?')) {
        const result = await apiCall(`/trains/${id}`, 'DELETE');
        if (result === true) {
            showToast('Train deleted successfully!', 'success');
            fetchTrains();
        } else {
            showToast('Could not delete train.', 'error');
        }
    }
};

$('addTrainForm').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        trainNo:    $('trainNo').value.trim(),
        trainName:  $('trainName').value.trim(),
        source:     $('source').value.trim(),
        destination:$('destination').value.trim(),
        dep:        $('depTime').value,
        arr:        $('arrTime').value,
        totalSeats: parseInt($('totalSeats').value),
        price:      parseInt($('price').value)
    };
    const result = await apiCall('/trains', 'POST', payload);
    if (result === true) {
        showToast('Train added!', 'success');
        $('addTrainForm').reset();
        fetchTrains();
    } else {
        showToast(typeof result === 'string' ? result : 'Could not add train.', 'error');
    }
};

/* ================================================================
   BOOKINGS — unchanged logic
   ================================================================ */

const fetchBookings = async () => renderBookings(await apiCall('/bookings') || uiData.mock.bookings);

const renderBookings = bookings => {
    $('bookingsTableBody').innerHTML = bookings.length
        ? bookings.map(x => `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="p-6 font-mono font-bold text-ryblue-600">${x.id}</td>
                <td class="p-6 font-bold text-slate-800">${x.passengerName}</td>
                <td class="p-6 text-slate-500">${x.trainName || x.trainId}</td>
                <td class="p-6 text-slate-500">${x.date}</td>
                <td class="p-6">
                    <span class="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Confirmed
                    </span>
                </td>
                <td class="p-6 text-right">
                    <button onclick="cancelBooking('${x.id}')"
                        class="text-xs font-bold text-ryred-500 hover:text-ryred-600 bg-ryred-50 hover:bg-ryred-100 px-4 py-2 rounded-xl transition-colors">
                        Cancel
                    </button>
                </td>
            </tr>`).join('')
        : `<tr><td colspan="6" class="p-16 text-center font-bold text-slate-400">No active bookings.</td></tr>`;
};

window.cancelBooking = async id => {
    if (confirm('Cancel this booking?')) {
        const result = await apiCall(`/bookings/${id}`, 'DELETE');
        if (result === true) {
            showToast('Booking cancelled!', 'success');
            fetchBookings();
        } else {
            showToast('Could not cancel booking.', 'error');
        }
    }
};

/* ================================================================
   INIT
   ================================================================ */
window.onload = () => {
    const today = new Date().toISOString().split('T')[0];

    // Set date minimums & defaults
    $('homeDate').min   = today;
    $('homeDate').value = today;
    $('ticketDate').min = today;
    $('ticketDate').value = today;

    // Preload admin trains
    fetchTrains();
};