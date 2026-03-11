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
/* ── Updated Train search with Date Validation ──────────────── */
$('ticketSearchForm').onsubmit = async (e) => {
    e.preventDefault();

    const from = $('ticketFrom').value.toLowerCase().trim();
    const to   = $('ticketTo').value.toLowerCase().trim();
    const selectedDate = $('ticketDate').value; // This is the date user wants to travel

    ticketState.date = selectedDate;

    // Show loading...
    $('ticketResults').innerHTML = `<div class="text-center py-16">...</div>`;

    const allTrains = await apiCall('/trains') || uiData.mock.trains;

    const filtered = allTrains.filter(t => {
        // 1. Check Route
        const routeMatch = t.source.toLowerCase().includes(from) && 
                           t.destination.toLowerCase().includes(to);
        
        // 2. Check Date Range
        // We convert strings to Date objects to compare them correctly
        const travel = new Date(selectedDate);
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);

        // A train is valid only if travel date is >= start AND <= end
        const dateMatch = travel >= start && travel <= end;

        return routeMatch && dateMatch;
    });

    renderTrainResults(filtered, from, to, selectedDate);
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

/* ... (Keep your Tailwind config and Helpers at the top) ... */

/* ── Updated Admin Logic: Sending Dates ── */
$('addTrainForm').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        trainNo:      $('trainNo').value.trim(),
        trainName:    $('trainName').value.trim(),
        source:       $('source').value.trim(),
        destination:  $('destination').value.trim(),
        dep:          $('depTime').value,
        arr:          $('arrTime').value,
        startDate:    $('startDate').value, // Grabbed from new inputs
        endDate:      $('endDate').value,   // Grabbed from new inputs
        totalSeats:   parseInt($('totalSeats').value),
        price:        parseInt($('price').value)
    };
    const result = await apiCall('/trains', 'POST', payload);
    if (result === true) {
        showToast('Train added to schedule!', 'success');
        $('addTrainForm').reset();
        fetchTrains();
    } else {
        showToast(typeof result === 'string' ? result : 'Error adding train.', 'error');
    }
};

/* ── Updated Search Filter: Zero-Time Comparison ── */
$('ticketSearchForm').onsubmit = async (e) => {
    e.preventDefault();
    const from = $('ticketFrom').value.toLowerCase().trim();
    const to   = $('ticketTo').value.toLowerCase().trim();
    const selectedDate = $('ticketDate').value;

    ticketState.date = selectedDate;
    $('ticketResults').innerHTML = `<div class="text-center py-16 animate-pulse text-slate-400 font-bold">Checking tracks...</div>`;

    const allTrains = await apiCall('/trains') || [];

    const filtered = allTrains.filter(t => {
        const routeMatch = t.source.toLowerCase().includes(from) && 
                           t.destination.toLowerCase().includes(to);
        
        // If train has no dates (old data), we skip date check to avoid errors
        if (!t.startDate || !t.endDate) return routeMatch;

        const travel = new Date(selectedDate).setHours(0,0,0,0);
        const start  = new Date(t.startDate).setHours(0,0,0,0);
        const end    = new Date(t.endDate).setHours(0,0,0,0);

        return routeMatch && (travel >= start && travel <= end);
    });

    renderTrainResults(filtered, from, to, selectedDate);
};

async function getPlaceImage(place) {
    try {
        const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(place)}`
        );

        const data = await res.json();

        return data.thumbnail?.source || `https://picsum.photos/seed/${encodeURIComponent(place)}/400/300`;

    } catch (err) {
        return `https://picsum.photos/seed/${encodeURIComponent(place)}/400/300`;
    }
}

/* ── Sarvam AI Discovery Logic ── */
window.showBookingDetails = async (id) => {

    const bookings = await apiCall('/bookings') || [];
    const b = bookings.find(x => x.id === id);
    if (!b) return;

    $('modalTicketHeader').innerHTML = `
        <div class="flex flex-col gap-1 relative z-10">
            <span class="text-orange-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                <i class="ph-fill ph-sparkle"></i> AI Journey Guide
            </span>
            <h2 class="font-heading font-black text-3xl md:text-4xl">Exploring ${b.destination}</h2>
            <div class="flex items-center gap-3 mt-2 text-white/80 text-sm font-medium">
                <span>Train: ${b.trainName}</span>
                <span>•</span>
                <span>Travel Date: ${b.date}</span>
            </div>
        </div>
    `;

    $('aiDiscoveryContainer').innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-16 h-16 rounded-full border-4 border-ryblue-100 border-t-orange-500 animate-spin mb-6"></div>
            <p class="text-slate-500 font-heading font-bold text-lg mb-2">Generating your custom itinerary...</p>
            <p class="text-slate-400 text-sm">Sarvam AI is finding the best spots and hotels in ${b.destination}.</p>
        </div>
    `;

    $('ticketModal').classList.remove('hidden');

    try {

        const promptText = `You are a travel expert API. Create a short travel guide for ${b.destination}. 
        Return ONLY valid JSON:
        {
            "intro": "short welcome",
            "spots": [
                { "name": "spot", "desc": "description", "tip": "travel tip" }
            ],
            "hotels": [
                { "name": "hotel", "desc": "description", "price": "approx price" }
            ]
        }
        Include exactly 3 spots and 2 hotels.`;

        const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk_p7rqzicm_kY4hWmW5zhJUtHsjdLHR9VgU'
            },
            body: JSON.stringify({
                model: "sarvam-30b",
                messages: [
                    { role: "system", content: "Return JSON only." },
                    { role: "user", content: promptText }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`API Error ${response.status}`);
        }

        const data = await response.json();
        let aiResponse = data.choices[0].message.content;

        aiResponse = aiResponse.replace(/```json/gi, '').replace(/```/gi, '').trim();

        const guideData = JSON.parse(aiResponse);

        /* ---------- SPOTS WITH REAL IMAGES ---------- */

        let spotsHTML = await Promise.all(
            guideData.spots.map(async (spot) => {

                const img = await getPlaceImage(spot.name);
                return `
                <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col">

                    <div class="h-40 overflow-hidden relative">

                        <img
                        src="${img}"
                        alt="${spot.name}"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">

                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                        <h4 class="absolute bottom-4 left-4 right-4 font-heading font-black text-white text-lg leading-tight">
                            ${spot.name}
                        </h4>

                    </div>

                    <div class="p-5 flex-1 flex flex-col">
                        <p class="text-sm text-slate-600 mb-4 flex-1">${spot.desc}</p>

                        <div class="bg-orange-50 text-orange-700 text-xs p-3 rounded-xl border border-orange-100 flex gap-2 items-start">
                            <i class="ph-fill ph-lightbulb text-orange-500 text-base shrink-0"></i>
                            <span class="font-medium">${spot.tip}</span>
                        </div>
                    </div>

                </div>
                `;
            })
        ).then(cards => cards.join(""));

        /* ---------- HOTELS ---------- */

        let hotelsHTML = guideData.hotels.map(hotel => `
            <div class="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-ryblue-200 transition-colors">

                <img
                src="https://picsum.photos/seed/${encodeURIComponent(hotel.name + b.destination)}/100/100"
                class="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100">

                <div class="flex-1">
                    <h5 class="font-bold text-slate-800 text-sm leading-tight">${hotel.name}</h5>
                    <p class="text-xs text-slate-500 mt-1 line-clamp-1">${hotel.desc}</p>
                    <div class="text-emerald-600 font-bold text-xs mt-1">${hotel.price}</div>
                </div>

                <a
                href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name + ' ' + b.destination)}"
                target="_blank"
                class="bg-ryblue-50 hover:bg-ryblue-600 text-ryblue-600 hover:text-white shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                View
                </a>

            </div>
        `).join("");

        /* ---------- FINAL UI ---------- */

        $('aiDiscoveryContainer').innerHTML = `
            <div class="mb-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 text-orange-900 font-medium">
                ${guideData.intro}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div class="lg:col-span-2">
                    <h3 class="font-heading font-black text-xl text-slate-800 mb-4 flex items-center gap-2">
                        <i class="ph-fill ph-camera text-ryblue-500"></i> Top Spots to Visit
                    </h3>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        ${spotsHTML}
                    </div>
                </div>

                <div>
                    <h3 class="font-heading font-black text-xl text-slate-800 mb-4 flex items-center gap-2">
                        <i class="ph-fill ph-bed text-ryblue-500"></i> Recommended Stays
                    </h3>

                    <div class="space-y-3">
                        ${hotelsHTML}
                    </div>

                    <div class="mt-6 p-4 bg-ryblue-50 rounded-2xl text-center border border-ryblue-100">
                        <i class="ph-fill ph-info text-ryblue-400 text-2xl mb-2"></i>
                        <p class="text-xs text-slate-500 font-medium">
                            Prices and availability may vary. Book early to secure the best rates!
                        </p>
                    </div>
                </div>

            </div>
        `;

    } catch (error) {

        console.error("Fetch Error:", error);

        $('aiDiscoveryContainer').innerHTML = `
            <div class="p-6 bg-ryred-50 text-ryred-700 rounded-2xl text-sm font-bold border border-ryred-200 text-center">
                <i class="ph-fill ph-warning-circle text-3xl mb-2"></i>
                <p>Couldn't generate the AI guide at the moment.</p>
                <p class="text-xs font-normal mt-1 opacity-80">${error.message}</p>
            </div>
        `;
    }
};
/* ================================================================
   BOOKINGS — unchanged logic
   ================================================================ */

const fetchBookings = async () => renderBookings(await apiCall('/bookings') || uiData.mock.bookings);

const renderBookings = bookings => {
    $('bookingsTableBody').innerHTML = bookings.length
        ? bookings.map(x => `
            <tr onclick="showBookingDetails('${x.id}')" 
                class="group cursor-pointer hover:bg-slate-50/80 transition-all border-b border-slate-50 last:border-0">
                <td class="p-6 font-mono font-bold text-ryblue-600">
                    <div class="flex items-center gap-2">
                        <i class="ph-bold ph-ticket text-slate-300 group-hover:text-ryred-500 transition-colors"></i>
                        ${x.id}
                    </div>
                </td>
                <td class="p-6 font-bold text-slate-800">${x.passengerName}</td>
                <td class="p-6 text-slate-500">
                    <div class="font-medium">${x.trainName || x.trainId}</div>
                    <div class="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">${x.destination || 'Destination'}</div>
                </td>
                <td class="p-6 text-slate-500 font-medium">${x.date}</td>
                <td class="p-6">
                    <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Confirmed
                    </span>
                </td>
                <td class="p-6 text-right" onclick="event.stopPropagation()">
                    <button onclick="cancelBooking('${x.id}')"
                        class="text-xs font-bold text-ryred-500 hover:text-white hover:bg-ryred-500 border border-ryred-100 px-4 py-2 rounded-xl transition-all">
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