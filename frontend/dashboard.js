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

    window.openExerciseView = function(exerciseName) {
        const modal = document.getElementById('nfc-modal');
        document.getElementById('nfc-machine-name').textContent = exerciseName;
        
        // Reset modal to pre-tap state
        document.getElementById('trigger-tap-sync').classList.remove('hidden');
        document.getElementById('nfc-success-state').classList.add('hidden');

        modal.classList.remove('hidden');
    };

    // Attach to the UI button to mock the hardware tap
    document.getElementById('trigger-tap-sync').addEventListener('click', (e) => {
        window.simulateNFCTap();
    });

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
    const modalOverlay = document.getElementById('nfc-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.add('hidden');
            }
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

    function renderLockers(startIdx, endIdx) {
        if (!gridContainer) return;
        gridContainer.innerHTML = '';
        currentSelectedLocker = null;
        selectedLockerIdStr.textContent = '--';
        bookBtn.disabled = true;
        bookBtn.style.opacity = '0.5';
        bookBtn.style.pointerEvents = 'none';
        bookBtn.style.display = 'block';
        
        if (successMsg) successMsg.classList.add('hidden');

        // Render the locker grid
        for (let i = startIdx; i <= endIdx; i++) {
            const slot = document.createElement('div');
            slot.classList.add('locker-slot');
            slot.textContent = i;
            
            // Randomly assign occupied status (~30% chance for dummy data)
            const isOccupied = Math.random() < 0.3;
            
            if (isOccupied) {
                slot.classList.add('occupied');
            } else {
                slot.classList.add('available');
                slot.addEventListener('click', () => {
                    // Deselect previous
                    const prev = document.querySelector('.locker-slot.selected');
                    if (prev) prev.classList.remove('selected');
                    
                    // Select current
                    slot.classList.add('selected');
                    currentSelectedLocker = i;
                    
                    // Update Panel
                    selectedLockerIdStr.textContent = '#' + i;
                    bookBtn.disabled = false;
                    bookBtn.style.opacity = '1';
                    bookBtn.style.pointerEvents = 'auto';
                    bookBtn.style.display = 'block';
                    
                    if (successMsg) successMsg.classList.add('hidden');
                });
            }
            gridContainer.appendChild(slot);
        }
    }

    // Toggle Locker views
    if (btnMens && btnWomens) {
        btnMens.addEventListener('click', () => {
            btnWomens.classList.remove('active');
            btnWomens.style.background = 'transparent';
            btnWomens.style.border = '1px solid var(--panel-border)';
            btnMens.classList.add('active');
            btnMens.style.background = 'rgba(0, 220, 255, 0.1)';
            btnMens.style.border = '1px solid var(--accent-color)';
            renderLockers(1, 75);
        });

        btnWomens.addEventListener('click', () => {
            btnMens.classList.remove('active');
            btnMens.style.background = 'transparent';
            btnMens.style.border = '1px solid var(--panel-border)';
            btnWomens.classList.add('active');
            btnWomens.style.background = 'rgba(0, 220, 255, 0.1)';
            btnWomens.style.border = '1px solid var(--accent-color)';
            renderLockers(76, 100);
        });
        
        // Initial render
        renderLockers(1, 75);
    }

    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            if (currentSelectedLocker) {
                bookBtn.style.pointerEvents = 'none';
                bookBtn.style.opacity = '0.5';
                bookBtn.textContent = 'Processing...';
                
                setTimeout(() => {
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
                }, 800);
            }
        });
    }

});
