    tailwind.config = { 
        theme: { 
            extend: {
                fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'], heading: ['"Outfit"', 'sans-serif'] },
                colors: { 
                    ryblue: { 50:'#eef2f9', 100:'#d5def0', 500:'#173873', 600:'#122c5a', 700:'#0e2246', 900:'#071123' }, 
                    ryred: { 50:'#fef2f3', 100:'#fce5e8', 500:'#d63447', 600:'#c02e3f' } 
                },
                boxShadow: { glass: '0 8px 32px 0 rgba(31,38,135,0.07)', float: '0 20px 40px -10px rgba(0,0,0,0.1)', card: '0 4px 20px -2px rgba(0,0,0,0.05)' }
            }
        }
    }

        const API_BASE = '';    
        const $ = id => document.getElementById(id);

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
        // Keeping mock data fallback just in case the server goes offline
        mock: { trains: [], bookings: [] }
    };

    // Inject Static HTML
    $('featuresGrid').innerHTML = uiData.features.map(f => `<div class="group p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-float transition-all ${f.cls||''}"><div class="w-16 h-16 rounded-2xl bg-${f.bg}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition"><img src="https://img.icons8.com/color/96/${f.icon}" class="w-10 h-10"></div><h3 class="font-heading font-bold text-xl mb-2">${f.title}</h3><p class="text-sm text-slate-500">${f.desc}</p></div>`).join('');
    $('faqContainer').innerHTML = uiData.faqs.map(f => `<div class="bg-white rounded-2xl p-6 cursor-pointer border-2 border-transparent hover:border-ryblue-100 shadow-sm transition" onclick="this.lastElementChild.classList.toggle('hidden');this.querySelector('i').classList.toggle('ph-minus')"><div class="flex justify-between items-center font-heading font-bold text-lg">${f.q}<div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-ryblue-600"><i class="ph-bold ph-plus"></i></div></div><div class="text-slate-600 mt-4 text-sm hidden font-medium border-t border-slate-100 pt-4">${f.a}</div></div>`).join('');
    $('footerLinks').innerHTML = uiData.footer.map(f => `<div><h4 class="font-heading font-bold mb-6 text-xl">${f.t}</h4><ul class="space-y-4 text-sm text-slate-500 font-medium">${f.l.map(i=>`<li><a href="#" class="hover:text-ryred-500 transition">${i}</a></li>`).join('')}</ul></div>`).join('') + `<div class="col-span-2 lg:border-l lg:border-slate-100 lg:pl-12"><div class="font-heading font-black text-2xl mb-4">RAIL सारथी</div><p class="text-sm text-slate-500 mb-6 font-medium">One-stop solution for travel discovery. Safar aapka, saarthi hum.</p><p class="text-sm font-bold">Rail-Sarthi Tech Pvt Ltd</p></div>`;

    // UI Logic
    const showToast = (msg, type='success') => {
        const t = document.createElement('div'); t.className = `toast ${type}`; t.innerHTML = `<i class="ph-bold ${type==='success'?'ph-check-circle':'ph-warning-circle'} text-2xl"></i><span>${msg}</span>`;
        $('toast-container').appendChild(t); setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 300); }, 3000);
    };

    const switchTab = id => {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.remove('text-ryblue-600','font-bold');
            b.classList.add('text-slate-500');
        });

        const selectedTab = document.getElementById(id);
        if (!selectedTab) return;

        selectedTab.classList.add('active');

        const btn = document.querySelector(`[data-tab="${id}"]`);
        if (btn) {
            btn.classList.remove('text-slate-500');
            btn.classList.add('text-ryblue-600','font-bold');
        }

        if (id === 'bookings') fetchBookings();
        if (id === 'admin') fetchTrains();
    };

    // REAL API Wrapper (Connects to backend)
    const apiCall = async (url, method='GET', body=null) => {
        try {
            const r = await fetch(API_BASE + url, {
                method,
                headers: body ? {'Content-Type':'application/json'} : {},
                body: body ? JSON.stringify(body) : null
            });

            if (!r.ok) {
                const errData = await r.json().catch(() => ({}));
                console.error("API Error:", r.status, errData);
                // Return actual error message so we can show it in the Toast
                return method === 'GET' ? false : (errData.message || `Server Error ${r.status}`);
            }
            return method === 'GET' ? await r.json() : true;
        } catch (err) {
            console.error("Fetch Failed:", err);
            return method === 'GET' ? false : "Server offline or CORS error";
        }
    };

    // === NEW BOOKING FLOW LOGIC ===
    let currentBookingState = { date: null, trainId: null, trainInfo: null };

    // Toggle between Wizard Steps
    const goToStep = (stepNumber) => {
        $('step1Search').classList.add('hidden');
        $('step2Results').classList.add('hidden');
        $('step3Book').classList.add('hidden');
        
        if(stepNumber === 1) {
            $('step1Search').classList.remove('hidden');
            $('bookingBoxTitle').innerText = "Apni Yatra Plan Karein";
            $('bookingBoxSubtitle').innerText = "Securely search and book tickets in under a minute.";
        } else if(stepNumber === 2) {
            $('step2Results').classList.remove('hidden');
            $('bookingBoxTitle').innerText = "Select Train";
            $('bookingBoxSubtitle').innerText = "Choose from available options.";
        } else if(stepNumber === 3) {
            $('step3Book').classList.remove('hidden');
            $('bookingBoxTitle').innerText = "Passenger Details";
            $('bookingBoxSubtitle').innerText = "Almost done! Enter traveler information.";
        }
    };

    // Format time from 24h to 12h AM/PM
    const formatTime = (timeStr) => {
        if(!timeStr) return "--:--";
        const [h, m] = timeStr.split(':');
        let hours = parseInt(h);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${m} ${ampm}`;
    };

    // Step 1: Search Submit
    $('step1Search').onsubmit = async (e) => {
        e.preventDefault();
        const from = $('searchFrom').value.toLowerCase().trim();
        const to = $('searchTo').value.toLowerCase().trim();
        currentBookingState.date = $('journeyDate').value;

        // Fetch from real API & filter
        const allTrains = await apiCall('/trains') || uiData.mock.trains;
        const filteredTrains = allTrains.filter(t => 
            t.source.toLowerCase().includes(from) && 
            t.destination.toLowerCase().includes(to)
        );

        // Render Results
        $('routeDisplay').innerText = `${$('searchFrom').value} to ${$('searchTo').value}`;
        
        if(filteredTrains.length === 0) {
            $('trainListContainer').innerHTML = `<div class="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100"><i class="ph-fill ph-warning-circle text-4xl text-slate-300 mb-2"></i><p class="font-bold text-slate-500">No trains found for this route.</p><button type="button" onclick="goToStep(1)" class="mt-4 text-ryblue-600 font-bold text-sm underline">Try different stations</button></div>`;
        } else {
            $('trainListContainer').innerHTML = filteredTrains.map(t => `
                <div class="bg-white border-2 border-slate-100 rounded-2xl p-4 hover:border-ryblue-400 cursor-pointer transition-all hover:shadow-md flex justify-between items-center group" onclick="selectTrainForBooking('${t.id}')">
                    <div>
                        <div class="font-heading font-black text-ryblue-900 text-lg flex items-center gap-2">
                            ${t.trainName} <span class="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded font-mono font-bold">${t.trainNo}</span>
                        </div>
                        <div class="flex items-center gap-3 text-sm font-medium text-slate-600 mt-2">
                            <div class="flex flex-col"><span class="font-bold text-slate-800">${formatTime(t.dep)}</span><span class="text-[10px] uppercase text-slate-400">${t.source}</span></div>
                            <div class="w-8 border-t-2 border-dashed border-slate-300 relative"><i class="ph-fill ph-train absolute -top-2 left-1/2 -translate-x-1/2 text-slate-300"></i></div>
                            <div class="flex flex-col"><span class="font-bold text-slate-800">${formatTime(t.arr)}</span><span class="text-[10px] uppercase text-slate-400">${t.destination}</span></div>
                        </div>
                    </div>
                    <div class="text-right pl-4 border-l border-slate-100">
                        <div class="font-black text-emerald-600 text-xl">₹${t.price}</div>
                        <div class="text-xs font-bold text-slate-400 mt-1">${t.totalSeats} Seats</div>
                        <div class="text-ryblue-600 font-bold text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">Select <i class="ph-bold ph-arrow-right"></i></div>
                    </div>
                </div>
            `).join('');
        }
        
        goToStep(2);
    };

    // Step 2: Select Train
    window.selectTrainForBooking = async (id) => {
        currentBookingState.trainId = id;
        const allTrains = await apiCall('/trains') || uiData.mock.trains;
        currentBookingState.trainInfo = allTrains.find(t => t.id === id);
        
        const t = currentBookingState.trainInfo;
        $('selectedTrainInfo').innerHTML = `
            <div>
                <div class="font-black text-lg">${t.trainName} (${t.trainNo})</div>
                <div class="text-xs text-ryblue-600 mt-1">${formatTime(t.dep)} to ${formatTime(t.arr)} • ${currentBookingState.date}</div>
            </div>
            <div class="text-right">
                <div class="font-black text-emerald-600 text-xl">₹${t.price}</div>
            </div>
        `;
        
        goToStep(3);
    };

    // Step 3: Final Submit
    $('step3Book').onsubmit = async (e) => {
        e.preventDefault(); 
        const b = { 
            trainId: currentBookingState.trainId, 
            passengerName: $('passengerName').value, 
            age: $('passengerAge').value, 
            date: currentBookingState.date 
        }; 
        
        if(!b.trainId) return showToast("Select train", "error");
        
        // Updated to hit /bookings to match the backend router.post('/')
        const result = await apiCall('/bookings', 'POST', b);
        
        if (result === true) {
            showToast("Ticket Booked Successfully!"); 
            
            // Reset wizard
            e.target.reset();
            $('step1Search').reset();
            goToStep(1);
        } else {
            // Show the exact error returned from the backend
            showToast(result || "Failed to book ticket.", "error");
        }
    };


    // === ADMIN & VIEW LOGIC ===
    const fetchTrains = async () => renderTrains(await apiCall('/trains') || uiData.mock.trains);

    const renderTrains = t => {
        $('adminTrainsTableBody').innerHTML = t.length ? t.map(x => `
        <tr class="hover:bg-slate-50/50">
            <td class="p-6"><div class="font-heading font-bold text-lg">${x.trainName}</div><div class="text-xs text-slate-400 font-bold uppercase mt-1">No: <span class="text-ryblue-600">${x.trainNo}</span></div></td>
            <td class="p-6">
                <div class="font-bold text-sm bg-white border px-3 py-1.5 rounded-lg inline-flex">${x.source} &rarr; ${x.destination}</div>
                <div class="text-xs font-bold text-slate-500 mt-2"><i class="ph-bold ph-clock"></i> ${formatTime(x.dep)} - ${formatTime(x.arr)}</div>
            </td>
            <td class="p-6 font-bold text-sm"><div class="mb-1"><i class="ph-fill ph-armchair mr-1"></i>${x.totalSeats} seats</div><div class="text-base text-emerald-600">₹${x.price}</div></td>
            <td class="p-6 text-right"><button onclick="viewTrainDetails('${x.id}')" class="w-10 h-10 rounded-xl bg-ryblue-50 text-ryblue-600 mr-2"><i class="ph-bold ph-eye"></i></button><button onclick="deleteTrain('${x.id}')" class="w-10 h-10 rounded-xl bg-red-50 text-red-500"><i class="ph-bold ph-trash"></i></button></td>
        </tr>`).join('') : `<tr><td colspan="4" class="p-16 text-center font-bold text-slate-400">No trains.</td></tr>`;
    };

    window.viewTrainDetails = async id => {
        const t = await apiCall(`/trains/${id}`) || uiData.mock.trains.find(x => x.id === id); if(!t) return;
        $('modalContent').innerHTML = `<div class="space-y-4 font-medium"><div class="flex justify-between border-b pb-2"><span>ID</span><span class="font-mono bg-slate-100 px-2 rounded">${t.id}</span></div><div class="flex justify-between border-b pb-2"><span>Name</span><span class="font-bold">${t.trainName} (${t.trainNo})</span></div><div class="flex justify-between border-b pb-2"><span>Route</span><span class="text-ryblue-600 bg-ryblue-50 px-2 rounded">${t.source} &rarr; ${t.destination}</span></div><div class="flex justify-between border-b pb-2"><span>Timings</span><span class="font-bold text-slate-600">${formatTime(t.dep)} to ${formatTime(t.arr)}</span></div><div class="flex justify-between pt-2"><span>Fare</span><span class="font-black text-emerald-600 text-2xl">₹${t.price}</span></div></div>`;
        $('trainModal').classList.remove('hidden');
    };

    $('addTrainForm').onsubmit = async e => {
        e.preventDefault();
        const t = { 
            trainNo: $('trainNo').value, 
            trainName: $('trainName').value, 
            source: $('source').value, 
            destination: $('destination').value, 
            dep: $('depTime').value,
            arr: $('arrTime').value,
            totalSeats: +$('totalSeats').value, 
            price: +$('price').value 
        };
        
        // Real API call to create train
        const result = await apiCall('/trains', 'POST', t);
        
        if (result === true) {
            showToast("Train added successfully!");
            e.target.reset();
            fetchTrains(); // Refetch from backend
        } else {
            // Show exact error message from backend
            showToast(result || "Failed to add train.", "error");
        }
    };

    window.deleteTrain = async id => {
        if(confirm("Delete this train?")) {
            const result = await apiCall(`/trains/${id}`, 'DELETE');
            if (result === true) {
                showToast("Deleted!");
                fetchTrains();
            } else {
                showToast(result || "Failed to delete train.", "error");
            }
        }
    };

    const fetchBookings = async () => renderBookings(await apiCall('/bookings') || uiData.mock.bookings);
    const renderBookings = b => $('bookingsTableBody').innerHTML = b.length ? b.map(x => `<tr class="hover:bg-slate-50/50"><td class="p-6 font-mono font-bold text-ryblue-600">${x.id}</td><td class="p-6 font-bold">${x.passengerName} <div class="text-xs text-slate-400">Age: ${x.age}</div></td><td class="p-6 font-bold text-slate-700">${x.trainName||x.trainId}</td><td class="p-6 font-bold">${x.date}</td><td class="p-6"><span class="bg-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-lg font-bold">Confirmed</span></td><td class="p-6 text-right"><button onclick="cancelBooking('${x.id}')" class="text-ryred-500 border hover:bg-ryred-50 px-4 py-2 rounded-xl font-bold">Cancel</button></td></tr>`).join('') : `<tr><td colspan="6" class="p-16 text-center font-bold text-slate-400">No active bookings.</td></tr>`;

    window.cancelBooking = async id => {
        if(confirm("Cancel booking?")) {
            // Updated to hit /bookings/:id to match the backend router.delete('/:id')
            const result = await apiCall(`/bookings/${id}`, 'DELETE');
            if (result === true) {
                showToast("Booking Cancelled!");
                fetchBookings();
            } else {
                showToast(result || "Failed to cancel booking.", "error");
            }
        }
    };

    // Initialize App
    window.onload = () => { 
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        $('journeyDate').min = today; 
        $('journeyDate').value = today;
        
        fetchTrains(); 
    };