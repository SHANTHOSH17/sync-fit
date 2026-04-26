document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Tab Navigation ---
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            link.classList.add('active');
            const targetId = link.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- 2. Live Capacity Ring Animation ---
    const circle = document.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    function setProgress(percent) {
        const offset = circumference - percent / 100 * circumference;
        circle.style.strokeDashoffset = offset;
    }

    // Animate to 42% on load
    setTimeout(() => {
        setProgress(42); 
    }, 500);


    // --- 3. Tracker Split Logic ---
    const splitBtns = document.querySelectorAll('.split-btn');
    const titleEl = document.getElementById('current-split-title');
    const checklistDiv = document.getElementById('exercise-list-container');

    const splitData = {
        'push': { title: 'Push Routine', exercises: [
            {name: 'Barbell Bench Press', rec: '4 Sets x 8-10 Reps'}, 
            {name: 'Incline Dumbbell Press', rec: '3 Sets x 10-12 Reps'}, 
            {name: 'Tricep Pushdowns', rec: '3 Sets x 15 Reps'}, 
            {name: 'Overhead Press', rec: '4 Sets x 8 Reps'}
        ]},
        'pull': { title: 'Pull Routine', exercises: [
            {name: 'Deadlifts', rec: '4 Sets x 5 Reps'}, 
            {name: 'Pull-Ups', rec: '3 Sets to Failure'}, 
            {name: 'Barbell Rows', rec: '3 Sets x 10 Reps'}, 
            {name: 'Bicep Curls', rec: '4 Sets x 12 Reps'}
        ]},
        'legs': { title: 'Legs Routine', exercises: [
            {name: 'Barbell Back Squat', rec: '4 Sets x 8 Reps'}, 
            {name: 'Leg Press', rec: '3 Sets x 12 Reps'}, 
            {name: 'Hamstring Curls', rec: '3 Sets x 15 Reps'}, 
            {name: 'Calf Raises', rec: '4 Sets x 20 Reps'}
        ]},
        'upper': { title: 'Upper Body', exercises: [
            {name: 'Bench Press', rec: '4 Sets x 10 Reps'},
            {name: 'Pull-Ups', rec: '4 Sets x 8 Reps'}
        ]},
        'lower': { title: 'Lower Body & Core', exercises: [
            {name: 'Barbell Squats', rec: '4 Sets x 10 Reps'},
            {name: 'Planks', rec: '3 Sets x 60 Seconds'}
        ]},
        'cardio1': { title: 'HIIT Treadmill', exercises: [
            {name: 'Treadmill Sprints', rec: '10 Sets x 30s Sprint / 30s Walk'},
            {name: 'Incline Walk', rec: '15 Minutes'}
        ]},
        'cardio2': { title: 'Steady State Cycling', exercises: [
            {name: 'Stationary Bike', rec: '45 Minutes, Moderate Pace'}
        ]},
        'cardio3': { title: 'Rowing Machine Intervals', exercises: [
            {name: 'Rowing Machine', rec: '8 Sets x 500m'}
        ]},
        'cardio4': { title: 'Stairmaster Climb', exercises: [
            {name: 'Stairmaster', rec: '30 Minutes, Level 8-10'}
        ]},
        'cardio5': { title: 'Elliptical Endurance', exercises: [
            {name: 'Elliptical', rec: '40 Minutes, Resistance 12'}
        ]}
    };

    splitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            splitBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const splitKey = btn.getAttribute('data-split');
            const data = splitData[splitKey];
            
            // Re-render UI
            titleEl.textContent = data.title;
            if(checklistDiv) {
                checklistDiv.innerHTML = data.exercises.map(ex => `
                    <div class="exercise-item">
                        <div class="ex-info">
                            <strong>${ex.name}</strong>
                            <div class="ex-target">Target: ${ex.rec}</div>
                        </div>
                        <button class="btn accent-btn small-btn" onclick="window.openExerciseView('${ex.name}')">NFC Sync</button>
                    </div>
                `).join('');
            }
        });
    });

    // Initialize list with first active element
    splitBtns[0].click();

    // --- 4. NFC Hardware Simulation Bridge ---
    // This function is exposed globally so that an external system (like Arduino) can trigger it.
    window.simulateNFCTap = function() {
        document.getElementById('trigger-tap-sync').classList.add('hidden');
        document.getElementById('nfc-success-state').classList.remove('hidden');
    };

    let currentExerciseName = '';
    const exerciseHistory = {};

    window.openExerciseView = function(exerciseName) {
        currentExerciseName = exerciseName;
        const selectionModal = document.getElementById('sync-selection-modal');
        document.getElementById('selection-machine-name').textContent = exerciseName;
        
        // Update previous stats based on history
        const statsEl = document.getElementById('nfc-synced-stats');
        if (statsEl) {
            statsEl.classList.remove('hidden');
            
            const prevWeightValue = document.getElementById('prev-weight-value');
            const prevMotivation = document.getElementById('prev-motivation');
            
            if (exerciseHistory[exerciseName]) {
                const lastWeight = exerciseHistory[exerciseName];
                prevWeightValue.textContent = lastWeight + ' lbs';
                const targetWeight = parseInt(lastWeight) + 10;
                prevMotivation.textContent = `🔥 You crushed it last week! You are ready to aim for ${targetWeight} lbs today to maximize your strength gain.`;
            } else {
                prevWeightValue.textContent = '225 lbs';
                prevMotivation.textContent = `🔥 You crushed it last week! You are ready to aim for 235 lbs today to maximize your strength gain.`;
            }
        }
        
        selectionModal.classList.remove('hidden');
    };

    // Selection Modal Listeners
    const closeSyncSelection = document.getElementById('close-sync-selection');
    if (closeSyncSelection) {
        closeSyncSelection.addEventListener('click', () => {
            document.getElementById('sync-selection-modal').classList.add('hidden');
        });
    }

    const btnSelectNfc = document.getElementById('btn-select-nfc');
    if (btnSelectNfc) {
        btnSelectNfc.addEventListener('click', () => {
            document.getElementById('sync-selection-modal').classList.add('hidden');
            openNfcModal(currentExerciseName);
        });
    }

    const btnSelectManual = document.getElementById('btn-select-manual');
    if (btnSelectManual) {
        btnSelectManual.addEventListener('click', () => {
            document.getElementById('sync-selection-modal').classList.add('hidden');
            openManualModal(currentExerciseName);
        });
    }

    function openNfcModal(exerciseName) {
        const modal = document.getElementById('nfc-modal');
        document.getElementById('nfc-machine-name').textContent = exerciseName;
        
        // Reset modal to pre-tap state
        document.getElementById('trigger-tap-sync').classList.remove('hidden');
        document.getElementById('nfc-success-state').classList.add('hidden');

        modal.classList.remove('hidden');
    }

    function openManualModal(exerciseName) {
        const modal = document.getElementById('manual-entry-modal');
        document.getElementById('manual-machine-name').textContent = exerciseName;
        document.getElementById('manual-modal-weight').value = '';
        document.getElementById('manual-success-state').classList.add('hidden');
        document.getElementById('btn-submit-manual').style.display = 'block';
        
        modal.classList.remove('hidden');
    }

    // Attach to the UI button to mock the hardware tap
    const triggerTapSync = document.getElementById('trigger-tap-sync');
    if (triggerTapSync) {
        triggerTapSync.addEventListener('click', (e) => {
            window.simulateNFCTap();
        });
    }

    const btnSubmitManual = document.getElementById('btn-submit-manual');
    if (btnSubmitManual) {
        btnSubmitManual.addEventListener('click', () => {
            const weightInput = document.getElementById('manual-modal-weight');
            const weight = weightInput.value;
            if (!weight) {
                alert('Please enter a weight');
                return;
            }
            
            // Save to history so it shows up next time
            exerciseHistory[currentExerciseName] = weight;
            
            const successState = document.getElementById('manual-success-state');
            successState.classList.remove('hidden');
            successState.querySelector('h3').textContent = `Successfully Logged: ${weight} lbs!`;
            
            btnSubmitManual.style.display = 'none';
        });
    }

    const closeManualBtn = document.getElementById('close-manual-entry');
    if (closeManualBtn) {
        closeManualBtn.addEventListener('click', () => {
            document.getElementById('manual-entry-modal').classList.add('hidden');
        });
    }

    const btnManualBack = document.getElementById('btn-manual-back');
    if (btnManualBack) {
        btnManualBack.addEventListener('click', () => {
            document.getElementById('manual-entry-modal').classList.add('hidden');
            
            // Switch to Tracker Tab
            const allLinks = document.querySelectorAll('.nav-link');
            const allTabs = document.querySelectorAll('.tab-content');
            allLinks.forEach(l => l.classList.remove('active'));
            allTabs.forEach(c => c.classList.remove('active'));
            
            const trackerTabLink = document.querySelector('[data-target="tracker-tab"]');
            if (trackerTabLink) trackerTabLink.classList.add('active');
            const trackerTab = document.getElementById('tracker-tab');
            if (trackerTab) trackerTab.classList.add('active');
        });
    }


    const sidebarTrigger = document.getElementById('nfc-trigger-btn');
    if(sidebarTrigger) {
        sidebarTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            window.openExerciseView('General Machine Sync');
        });
    }

    document.getElementById('close-nfc').addEventListener('click', () => {
        document.getElementById('nfc-modal').classList.add('hidden');
    });

    // Simple interaction logic
    const playOverlay = document.querySelector('.play-overlay');
    if (playOverlay) {
        playOverlay.addEventListener('click', () => {
            alert("Playing 10s generic form video...");
        });
    }

    // Connect the success modal button to close modal and switch to Tracker
    const loadSettingsBtn = document.querySelector('.load-settings-btn');
    if (loadSettingsBtn) {
        loadSettingsBtn.addEventListener('click', () => {
            // Close NFC modal
            document.getElementById('nfc-modal').classList.add('hidden');
            
            // Switch to Tracker Tab
            const allLinks = document.querySelectorAll('.nav-link');
            const allTabs = document.querySelectorAll('.tab-content');
            allLinks.forEach(l => l.classList.remove('active'));
            allTabs.forEach(c => c.classList.remove('active'));
            
            const trackerTabLink = document.querySelector('[data-target="tracker-tab"]');
            if (trackerTabLink) trackerTabLink.classList.add('active');
            document.getElementById('tracker-tab').classList.add('active');
        });
    }

    // Connect the back button to switch to Home Dashboard
    const backHomeBtn = document.querySelector('.back-home-btn');
    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', () => {
            document.getElementById('nfc-modal').classList.add('hidden');
            
            const allLinks = document.querySelectorAll('.nav-link');
            const allTabs = document.querySelectorAll('.tab-content');
            allLinks.forEach(l => l.classList.remove('active'));
            allTabs.forEach(c => c.classList.remove('active'));
            
            const homeTabLink = document.querySelector('[data-target="home-tab"]');
            if (homeTabLink) homeTabLink.classList.add('active');
            document.getElementById('home-tab').classList.add('active');
        });
    }

    // Connect overlay click to close modal
    const nfcModalOverlay = document.getElementById('nfc-modal');
    if (nfcModalOverlay) {
        nfcModalOverlay.addEventListener('click', (e) => {
            if (e.target === nfcModalOverlay) {
                nfcModalOverlay.classList.add('hidden');
            }
        });
    }

    const syncSelectionModal = document.getElementById('sync-selection-modal');
    if (syncSelectionModal) {
        syncSelectionModal.addEventListener('click', (e) => {
            if (e.target === syncSelectionModal) syncSelectionModal.classList.add('hidden');
        });
    }

    const manualEntryModal = document.getElementById('manual-entry-modal');
    if (manualEntryModal) {
        manualEntryModal.addEventListener('click', (e) => {
            if (e.target === manualEntryModal) manualEntryModal.classList.add('hidden');
        });
    }

    // --- Membership Plan Modal ---
    const renewEarlyBtn = document.getElementById('renew-early-btn');
    const planModal = document.getElementById('plan-modal');
    const closePlanModalBtn = document.getElementById('close-plan-modal');

    if (renewEarlyBtn && planModal) {
        renewEarlyBtn.addEventListener('click', () => {
            planModal.classList.remove('hidden');
        });
    }

    if (closePlanModalBtn && planModal) {
        closePlanModalBtn.addEventListener('click', () => {
            planModal.classList.add('hidden');
        });
    }

    if (planModal) {
        planModal.addEventListener('click', (e) => {
            if (e.target === planModal) {
                planModal.classList.add('hidden');
            }
        });
    }

    const planBtns = document.querySelectorAll('.plan-btn');
    const currentPlanDisplay = document.getElementById('current-plan-display');
    const allPlanCards = document.querySelectorAll('.plan-card');
    
    planBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedPlan = btn.getAttribute('data-plan');
            const card = btn.closest('.plan-card');

            // Reset all cards
            allPlanCards.forEach(c => {
                c.style.background = 'rgba(255,255,255,0.02)';
                c.style.border = '1px solid var(--panel-border)';
                c.style.boxShadow = 'none';
                c.querySelector('.plan-title').style.color = '';
                
                const span = c.querySelector('span');
                if (span) span.style.color = '';
                
                const cb = c.querySelector('.plan-btn');
                if (cb) {
                    cb.disabled = false;
                    cb.style.background = 'transparent';
                    cb.style.color = 'var(--text-primary)';
                    cb.style.border = '1px solid var(--panel-border)';
                    cb.style.cursor = 'pointer';
                    // Determine if upgrade or downgrade text
                    const currentPrice = parseInt(card.querySelector('span').textContent.replace(/\D/g, ''));
                    const thisPrice = parseInt(c.querySelector('span').textContent.replace(/\D/g, ''));
                    cb.textContent = thisPrice > currentPrice ? 'Upgrade' : 'Downgrade';
                }
            });

            // Activate chosen card
            card.style.background = 'rgba(0,220,255,0.05)';
            card.style.border = '1px solid var(--accent-color)';
            card.style.boxShadow = '0 0 15px var(--accent-glow)';
            card.querySelector('.plan-title').style.color = 'var(--accent-color)';
            card.querySelector('span').style.color = 'var(--accent-color)';
            
            btn.disabled = true;
            btn.style.background = 'var(--text-secondary)';
            btn.style.color = 'black';
            btn.style.border = 'none';
            btn.style.cursor = 'not-allowed';
            btn.textContent = 'Current';

            // Update top text
            if(currentPlanDisplay) currentPlanDisplay.textContent = selectedPlan;
        });
    });

    // --- Logout ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('syncfit_user');
            window.location.href = 'index.html';
        });
    }

    // --- Locker Grid Logic ---
    const gridContainer = document.getElementById('locker-grid-container');
    const btnMens = document.getElementById('btn-mens');
    const btnWomens = document.getElementById('btn-womens');
    const selectedLockerIdStr = document.getElementById('selected-locker-id');
    const bookBtn = document.getElementById('book-locker-btn');
    const successMsg = document.getElementById('locker-success-msg');
    
    let currentSelectedLocker = null;

    let lockersData = [];

    async function fetchLockers() {
        try {
            const res = await fetch('/api/lockers');
            lockersData = await res.json();
        } catch (err) {
            console.error('Error fetching lockers', err);
        }
    }

    async function renderLockers(type) {
        if (!gridContainer) return;
        
        await fetchLockers(); // Always fetch fresh data
        
        gridContainer.innerHTML = '';
        currentSelectedLocker = null;
        selectedLockerIdStr.textContent = '--';
        bookBtn.disabled = true;
        bookBtn.style.opacity = '0.5';
        bookBtn.style.pointerEvents = 'none';
        bookBtn.style.display = 'block';
        
        if (successMsg) successMsg.classList.add('hidden');

        // Filter by type
        const filtered = lockersData.filter(l => l.type === type);

        // Render the locker grid
        filtered.forEach(locker => {
            const slot = document.createElement('div');
            slot.classList.add('locker-slot');
            slot.textContent = locker.id;
            
            if (locker.status === 'occupied') {
                slot.classList.add('occupied');
            } else {
                slot.classList.add('available');
                slot.addEventListener('click', () => {
                    // Deselect previous
                    const prev = document.querySelector('.locker-slot.selected');
                    if (prev) prev.classList.remove('selected');
                    
                    // Select current
                    slot.classList.add('selected');
                    currentSelectedLocker = locker.id;
                    
                    // Update Panel
                    selectedLockerIdStr.textContent = '#' + locker.id;
                    bookBtn.disabled = false;
                    bookBtn.style.opacity = '1';
                    bookBtn.style.pointerEvents = 'auto';
                    bookBtn.style.display = 'block';
                    
                    if (successMsg) successMsg.classList.add('hidden');
                });
            }
            gridContainer.appendChild(slot);
        });
    }

    // Toggle Locker views
    if (btnMens && btnWomens) {
        btnMens.addEventListener('click', () => {
            btnWomens.classList.remove('active');
            btnWomens.style.background = 'transparent';
            btnWomens.style.border = '1px solid var(--panel-border)';
            btnWomens.style.color = 'var(--text-secondary)';
            btnMens.classList.add('active');
            btnMens.style.background = 'rgba(0, 220, 255, 0.1)';
            btnMens.style.border = '1px solid var(--accent-color)';
            btnMens.style.color = 'var(--accent-color)';
            renderLockers('mens');
        });

        btnWomens.addEventListener('click', () => {
            btnMens.classList.remove('active');
            btnMens.style.background = 'transparent';
            btnMens.style.border = '1px solid var(--panel-border)';
            btnMens.style.color = 'var(--text-secondary)';
            btnWomens.classList.add('active');
            btnWomens.style.background = 'rgba(0, 220, 255, 0.1)';
            btnWomens.style.border = '1px solid var(--accent-color)';
            btnWomens.style.color = 'var(--accent-color)';
            renderLockers('womens');
        });
        
        // Initial render
        renderLockers('mens');
    }

    if (bookBtn) {
        bookBtn.addEventListener('click', async () => {
            if (currentSelectedLocker) {
                bookBtn.style.pointerEvents = 'none';
                bookBtn.style.opacity = '0.5';
                bookBtn.textContent = 'Processing...';
                
                const userObj = JSON.parse(localStorage.getItem('syncfit_user') || '{}');
                const userId = userObj.id || 1; // Fallback to 1 if not logged in properly for demo
                
                try {
                    const res = await fetch('/api/lockers/book', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lockerId: currentSelectedLocker, userId })
                    });
                    
                    if (res.ok) {
                        bookBtn.textContent = 'Book Locker';
                        bookBtn.style.display = 'none';
                        if (successMsg) {
                            successMsg.classList.remove('hidden');
                        }
                        
                        // Mark as occupied in grid visually
                        const selectedEl = document.querySelector('.locker-slot.selected');
                        if (selectedEl) {
                            selectedEl.classList.remove('selected', 'available');
                            selectedEl.classList.add('occupied');
                        }
                    } else {
                        const errData = await res.json();
                        alert('Error: ' + errData.error);
                        bookBtn.textContent = 'Book Locker';
                        bookBtn.style.pointerEvents = 'auto';
                        bookBtn.style.opacity = '1';
                    }
                } catch (err) {
                    console.error(err);
                    alert('Error communicating with server');
                    bookBtn.textContent = 'Book Locker';
                    bookBtn.style.pointerEvents = 'auto';
                    bookBtn.style.opacity = '1';
                }
            }
        });
    }

    // --- Complete Session Animation ---
    const completeBtn = document.querySelector('.complete-btn');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            // Transform button
            const originalText = completeBtn.textContent;
            completeBtn.innerHTML = '✓ Session Completed!';
            completeBtn.style.background = 'var(--success-color)';
            completeBtn.style.color = '#000';
            completeBtn.style.transform = 'scale(1.05)';
            
            // Simple DOM confetti
            for (let i = 0; i < 50; i++) {
                const conf = document.createElement('div');
                conf.classList.add('confetti');
                conf.style.left = Math.random() * 100 + 'vw';
                conf.style.animationDuration = (Math.random() * 2 + 1) + 's';
                conf.style.background = ['#00dcff', '#00ffaa', '#ffaa00', '#ffffff'][Math.floor(Math.random()*4)];
                document.body.appendChild(conf);
                
                // Cleanup
                setTimeout(() => conf.remove(), 3000);
            }

            // Reset button after 3s
            setTimeout(() => {
                completeBtn.textContent = originalText;
                completeBtn.style.background = '';
                completeBtn.style.color = '';
                completeBtn.style.transform = '';
            }, 3000);
        });
    }

    // --- Payment Modal Logic ---
    const makePaymentBtn = document.getElementById('make-payment-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModalBtn = document.getElementById('close-payment-modal');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    
    if (makePaymentBtn && paymentModal) {
        makePaymentBtn.addEventListener('click', () => {
            const currentPlanEl = document.getElementById('current-plan-display');
            const currentPlan = currentPlanEl ? currentPlanEl.textContent : 'Elite Tier';
            
            let price = '₹79/mo';
            if (currentPlan === 'Basic Tier') price = '₹29/mo';
            if (currentPlan === 'Premium Tier') price = '₹49/mo';
            
            const planNameEl = document.getElementById('payment-plan-name');
            const planPriceEl = document.getElementById('payment-plan-price');
            
            if (planNameEl) planNameEl.textContent = currentPlan;
            if (planPriceEl) planPriceEl.textContent = price;
            
            paymentModal.classList.remove('hidden');
        });
    }

    if (closePaymentModalBtn && paymentModal) {
        closePaymentModalBtn.addEventListener('click', () => {
            paymentModal.classList.add('hidden');
        });
    }

    if (confirmPaymentBtn && paymentModal) {
        confirmPaymentBtn.addEventListener('click', () => {
            alert('Payment Successful!');
            paymentModal.classList.add('hidden');
        });
    }
    
    if (paymentModal) {
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                paymentModal.classList.add('hidden');
            }
        });
    }

});
