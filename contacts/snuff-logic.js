document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('main-viewport');
    const flash = document.getElementById('flash-overlay');
    const dataField = document.getElementById('critical-data');
    const meltFilter = document.querySelector('#flesh-melt feTurbulence');
    
    // 1. ОПТИМИЗИРОВАННЫЕ ВИЗУАЛЬНЫЕ ЭФФЕКТЫ (requestAnimationFrame)
    let idleTime = 0;
    
    function updateVisuals() {
        // Редкие вспышки на грани восприятия
        if (Math.random() > 0.995 && flash) {
            flash.style.display = 'block';
            setTimeout(() => { flash.style.display = 'none'; }, 25);
        }
        
        // Плавная пульсация фильтра "плавления"
        if (meltFilter) {
            const freq = 0.02 + Math.sin(Date.now() / 1000) * 0.01;
            meltFilter.setAttribute('baseFrequency', freq);
        }

        requestAnimationFrame(updateVisuals);
    }
    updateVisuals();

    // 2. СЛЕЖКА (MouseMove Throttle)
    let tick = false;
    const texts = document.querySelectorAll('.white-mode, p, .val');

    document.addEventListener('mousemove', (e) => {
        idleTime = 0;
        if (!tick) {
            window.requestAnimationFrame(() => {
                // Эффект Uncanny Valley (наклон экрана за курсором)
                if (viewport) {
                    const x = (e.clientX / window.innerWidth - 0.5) * 4;
                    const y = (e.clientY / window.innerHeight - 0.5) * 4;
                    viewport.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
                }

                // Исчезающий свидетель (текст дрожит при приближении курсора)
                texts.forEach(t => {
                    const rect = t.getBoundingClientRect();
                    const dist = Math.hypot(e.clientX - rect.left, e.clientY - rect.top);
                    if (dist < 80) {
                        t.style.filter = `blur(${Math.random() * 2}px)`;
                        t.style.transform = `translate(${Math.random() * 3}px)`;
                    } else {
                        t.style.filter = ""; t.style.transform = "";
                    }
                });
                tick = false;
            });
            tick = true;
        }
    });

    // 3. ПСИХОЗ ДАННЫХ И ИНВЕРСИЯ ПРИ БЕЗДЕЙСТВИИ
    const phrases = [
        "ТЫ_МОРГАЕШЬ_СЛИШКОМ_ЧАСТО",
        `OS_DETECTED: ${window.navigator.platform}`,
        "КТО_СТОИТ_ЗА_СПИНОЙ?",
        "ОШИБКА_73",
        "ОНО_ЗАМЕТИЛО_ЧТО_ТЫ_ЗАМЕР"
    ];

    setInterval(() => {
        idleTime++;
        // Если пользователь замер на 5 секунд — инверсия
        if (idleTime > 10) {
            document.body.style.filter = "invert(1) contrast(500%)";
            if (dataField) dataField.innerText = "Я_ВИЖУ_ТЕБЯ";
        } else {
            document.body.style.filter = "contrast(180%) brightness(0.7)";
            // Редкая подмена текста в полях данных
            if (Math.random() > 0.90 && dataField) {
                dataField.innerText = phrases[Math.floor(Math.random() * phrases.length)];
                dataField.style.color = "white";
            }
        }
    }, 500);

    // 4. АУДИО-ПАРАЗИТ (Активация по клику)
    document.addEventListener('mousedown', () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        setInterval(() => {
            if (Math.random() > 0.92) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = Math.random() > 0.5 ? 'sawtooth' : 'square';
                // Либо низкий гул, либо ультразвуковой писк
                osc.frequency.setValueAtTime(Math.random() > 0.8 ? 15000 : 40, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.002, audioCtx.currentTime);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.1);
            }
        }, 4000);
    }, { once: true });
});

// БОНУС: Вторжение в буфер обмена
document.addEventListener('copy', (e) => {
    e.clipboardData.setData('text/plain', "ТЫ_СЛЕДУЮЩИЙ_P_R_I_O_N_73");
    e.preventDefault();
});