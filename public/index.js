tailwind.config = { theme: { extend: {
            fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'], heading: ['"Outfit"', 'sans-serif'] },
            colors: { ryblue: { 50:'#eef2f9', 100:'#d5def0', 500:'#173873', 600:'#122c5a', 700:'#0e2246', 900:'#071123' }, ryred: { 50:'#fef2f3', 100:'#fce5e8', 500:'#d63447', 600:'#c02e3f' } },
            boxShadow: { glass: '0 8px 32px 0 rgba(31,38,135,0.07)', float: '0 20px 40px -10px rgba(0,0,0,0.1)', card: '0 4px 20px -2px rgba(0,0,0,0.05)' }
        }}}

const API_BASE = ''; const $ = id => document.getElementById(id); // Tiny Helpers
        
        // Dynamic Data Rendering (Saves massive HTML lines)
        const uiData = {
            features: [
                { icon: "bank-cards.png", title: "Safe Payments", desc: "100% secure booking experience.", bg: "ryblue" },
                { icon: "customer-support.png", title: "Har Pal Support", desc: "Live help 7 days a week.", bg: "ryred", cls: "lg:mt-6" },
                { icon: "money-bag.png", title: "Turant Refunds", desc: "Get money back instantly.", bg: "emerald" },
                { icon: "train.png", title: "Live Tracking", desc: "Track your train's live location.", bg: "purple", cls: "lg:mt-6" }
            ],
            faqs: [
                { q: "Is Rail-Sarthi free to use?", a: "Haan ji! Browsing is free. Fees apply only on booking." },
                { q: "Mera data kitna safe hai?", a: "We use bank-level encryption. Details are strictly confidential." },
                { q: "Can I cancel my ticket online?", a: "Bilkul! Cancel easily via 'My Bookings' for auto-refunds." }
            ],
            footer: [
                { t: "Features", l: ["Live Status", "PNR Status", "Time Table", "Seat Info"] },
                { t: "Book", l: ["Bus Tickets", "Train Tickets", "Food"] },
                { t: "Info", l: ["About Us", "Contact Us", "FAQs"] }
            ],
            mock: {
                trains: [ { id: "1", trainNo: "12045", name: "Shatabdi Express", source: "New Delhi", destination: "Chandigarh", totalSeats: 500, price: 850 } ],
                bookings: []
            }
        };

        // Inject HTML
        $('featuresGrid').innerHTML = uiData.features.map(f => `<div class="group p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-float transition-all ${f.cls||''}"><div class="w-16 h-16 rounded-2xl bg-${f.bg}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition"><img src="https://img.icons8.com/color/96/${f.icon}" class="w-10 h-10"></div><h3 class="font-heading font-bold text-xl mb-2">${f.title}</h3><p class="text-sm text-slate-500">${f.desc}</p></div>`).join('');
        $('faqContainer').innerHTML = uiData.faqs.map(f => `<div class="bg-white rounded-2xl p-6 cursor-pointer border-2 border-transparent hover:border-ryblue-100 shadow-sm transition" onclick="this.lastElementChild.classList.toggle('hidden');this.querySelector('i').classList.toggle('ph-minus')"><div class="flex justify-between items-center font-heading font-bold text-lg">${f.q}<div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-ryblue-600"><i class="ph-bold ph-plus"></i></div></div><div class="text-slate-600 mt-4 text-sm hidden font-medium border-t border-slate-100 pt-4">${f.a}</div></div>`).join('');
        $('footerLinks').innerHTML = uiData.footer.map(f => `<div><h4 class="font-heading font-bold mb-6 text-xl">${f.t}</h4><ul class="space-y-4 text-sm text-slate-500 font-medium">${f.l.map(i=>`<li><a href="#" class="hover:text-ryred-500 transition">${i}</a></li>`).join('')}</ul></div>`).join('') + `<div class="col-span-2 lg:border-l lg:border-slate-100 lg:pl-12"><div class="font-heading font-black text-2xl mb-4">RAIL सारथी</div><p class="text-sm text-slate-500 mb-6 font-medium">One-stop solution for travel discovery. Safar aapka, saarthi hum.</p><p class="text-sm font-bold">Rail-Sarthi Tech Pvt Ltd</p></div>`;

        // UI Logic
        const showToast = (msg, type='success') => {
            const t = document.createElement('div'); t.className = `toast ${type}`; t.innerHTML = `<i class="ph-bold ${type==='success'?'ph-check-circle':'ph-warning-circle'} text-2xl"></i><span>${msg}</span>`;
            $('toast-container').appendChild(t); setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 300); }, 3000);
        };
        const switchTab = id => {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active')); document.querySelectorAll('.nav-btn').forEach(b => b.classList.replace('text-ryblue-600','text-slate-500')||b.classList.remove('font-bold'));
            $(id).classList.add('active'); const btn = document.querySelector(`[data-tab="${id}"]`); btn && (btn.classList.add('text-ryblue-600','font-bold'), btn.classList.remove('text-slate-500'));
            id === 'bookings' ? fetchBookings() : fetchTrains();
        };

        // API Wrapper
        const apiCall = async (url, method='GET', body=null) => {
            try { const r = await fetch(API_BASE+url, { method, headers: body?{'Content-Type':'application/json'}:{}, body: body?JSON.stringify(body):null });
            return r.ok||r.status===404 ? (method==='GET'?await r.json():true) : false; } catch { return null; }
        };

        // Train Logic
        const fetchTrains = async () => renderTrains(await apiCall('/trains') || uiData.mock.trains);
        const renderTrains = t => {
            $('trainSelect').innerHTML = '<option value="">Select a train...</option>' + t.map(x => `<option value="${x.id}">${x.trainNo} - ${x.name}</option>`).join('');
            $('adminTrainsTableBody').innerHTML = t.length ? t.map(x => `<tr class="hover:bg-slate-50/50"><td class="p-6"><div class="font-heading font-bold text-lg">${x.name}</div><div class="text-xs text-slate-400 font-bold uppercase mt-1">No: <span class="text-ryblue-600">${x.trainNo}</span></div></td><td class="p-6"><div class="font-bold text-sm bg-white border px-3 py-1.5 rounded-lg inline-flex">${x.source} &rarr; ${x.destination}</div></td><td class="p-6 font-bold text-sm"><div class="mb-1"><i class="ph-fill ph-armchair mr-1"></i>${x.totalSeats} seats</div><div class="text-base text-emerald-600">₹${x.price}</div></td><td class="p-6 text-right"><button onclick="viewTrainDetails('${x.id}')" class="w-10 h-10 rounded-xl bg-ryblue-50 text-ryblue-600 mr-2"><i class="ph-bold ph-eye"></i></button><button onclick="deleteTrain('${x.id}')" class="w-10 h-10 rounded-xl bg-red-50 text-red-500"><i class="ph-bold ph-trash"></i></button></td></tr>`).join('') : `<tr><td colspan="4" class="p-16 text-center font-bold text-slate-400">No trains.</td></tr>`;
        };
        const viewTrainDetails = async id => {
            const t = await apiCall(`/trains/${id}`) || uiData.mock.trains.find(x => x.id === id); if(!t) return;
            $('modalContent').innerHTML = `<div class="space-y-4 font-medium"><div class="flex justify-between border-b pb-2"><span>ID</span><span class="font-mono bg-slate-100 px-2 rounded">${t.id}</span></div><div class="flex justify-between border-b pb-2"><span>Name</span><span class="font-bold">${t.name} (${t.trainNo})</span></div><div class="flex justify-between border-b pb-2"><span>Route</span><span class="text-ryblue-600 bg-ryblue-50 px-2 rounded">${t.source} &rarr; ${t.destination}</span></div><div class="flex justify-between pt-2"><span>Fare</span><span class="font-black text-emerald-600 text-2xl">₹${t.price}</span></div></div>`;
            $('trainModal').classList.remove('hidden');
        };
        $('addTrainForm').onsubmit = async e => {
            e.preventDefault(); const t = { id: Date.now().toString(), trainNo: $('trainNo').value, name: $('trainName').value, source: $('source').value, destination: $('destination').value, totalSeats: +$('totalSeats').value, price: +$('price').value };
            if(await apiCall('/trains', 'POST', t) ?? (uiData.mock.trains.push(t), true)) { showToast("Train added!"); e.target.reset(); fetchTrains(); } else showToast("Failed to add", "error");
        };
        const deleteTrain = async id => confirm("Delete this train?") && (await apiCall(`/trains/${id}`, 'DELETE') ?? (uiData.mock.trains = uiData.mock.trains.filter(t=>t.id!==id), true)) ? (showToast("Deleted!"), fetchTrains()) : showToast("Failed", "error");

        // Booking Logic
        $('bookingForm').onsubmit = async e => {
            e.preventDefault(); const b = { trainId: $('trainSelect').value, passengerName: $('passengerName').value, age: $('passengerAge').value, date: $('journeyDate').value }; if(!b.trainId) return showToast("Select train", "error");
            if(await apiCall('/book', 'POST', b) ?? (uiData.mock.bookings.push({id:"BKG"+Math.floor(Math.random()*90000), ...b, trainName: uiData.mock.trains.find(x=>x.id===b.trainId)?.name}), true)) { showToast("Ticket Booked!"); e.target.reset(); } else showToast("Failed", "error");
        };
        const fetchBookings = async () => renderBookings(await apiCall('/bookings') || uiData.mock.bookings);
        const renderBookings = b => $('bookingsTableBody').innerHTML = b.length ? b.map(x => `<tr class="hover:bg-slate-50/50"><td class="p-6 font-mono font-bold text-ryblue-600">${x.id}</td><td class="p-6 font-bold">${x.passengerName} <div class="text-xs text-slate-400">Age: ${x.age}</div></td><td class="p-6 font-bold text-slate-700">${x.trainName||x.trainId}</td><td class="p-6 font-bold">${x.date}</td><td class="p-6"><span class="bg-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-lg font-bold">Confirmed</span></td><td class="p-6 text-right"><button onclick="cancelBooking('${x.id}')" class="text-ryred-500 border hover:bg-ryred-50 px-4 py-2 rounded-xl font-bold">Cancel</button></td></tr>`).join('') : `<tr><td colspan="6" class="p-16 text-center font-bold text-slate-400">No active bookings.</td></tr>`;
        const cancelBooking = async id => confirm("Cancel booking?") && (await apiCall(`/cancel/${id}`, 'DELETE') ?? (uiData.mock.bookings = uiData.mock.bookings.filter(b=>b.id!==id), true)) ? (showToast("Cancelled!"), fetchBookings()) : showToast("Failed", "error");

        window.onload = () => { $('journeyDate').min = new Date().toISOString().split('T')[0]; fetchTrains(); };