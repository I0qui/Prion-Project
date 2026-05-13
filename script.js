document.addEventListener('DOMContentLoaded', () => {
    
    console.log("Terminal Boot Sequence Complete...");

    // 1. Анимация появления текста (Typewriter effect)
    const elementsToType = document.querySelectorAll('.typewriter');
    elementsToType.forEach(el => {
        let text = el.innerText;
        el.innerText = '';
        let i = 0;
        let speed = 25; 

        function typeWriter() {
            if (i < text.length) {
                el.innerText += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        }
        setTimeout(typeWriter, 500); 
    });

    // 2. Часы (Timestamp)
    function updateTime() {
        let now = new Date();
        const timeEl = document.getElementById('currentTime');
        if(timeEl) timeEl.innerText = "TIMESTAMP: " + now.toLocaleTimeString();
    }
    setInterval(updateTime, 1000);

    // 3. Счетчик глобальной смертности
    let initialMortality = 1450302; 
    let counterElement = document.getElementById('mortalityCounter');

    function updateCounter() {
        if(counterElement) {
            initialMortality += Math.floor(Math.random() * 5); 
            counterElement.innerText = initialMortality.toLocaleString('ru-RU');
        }
    }
    setInterval(updateCounter, 100); 

    // --- НОВЫЙ БЛОК: ПОИСК ---
    const searchInput = document.getElementById('wiki-search');
    if(searchInput) {
        searchInput.addEventListener('keyup', function() {
            let filter = this.value.toUpperCase();
            let sections = document.querySelectorAll('.nav-section');
            sections.forEach(section => {
                let links = section.querySelectorAll('a');
                let hasVisibleLink = false;
                links.forEach(link => {
                    if (link.innerText.toUpperCase().indexOf(filter) > -1) {
                        link.style.display = "";
                        hasVisibleLink = true;
                    } else {
                        link.style.display = "none";
                    }
                });
                let header = section.querySelector('h4');
                if(header) header.style.display = hasVisibleLink ? "" : "none";
            });
        });
    }

    // --- УЛЬТИМАТИВНАЯ ГАЛЕРЕЯ (БЕЗ ДУБЛИКАТОВ) ---
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("img01");
    let currentImgIdx = 0;

    // 1. Собираем только УНИКАЛЬНЫЕ картинки по их адресу (src)
    const rawElements = document.querySelectorAll('.article-body img, .gallery-grid img, .infobox img, .thumb-right img');
    const seenSrcs = new Set();
    const images = []; 

    rawElements.forEach(img => {
        if (!seenSrcs.has(img.src) && img.id !== 'img01' && !img.src.includes('my-logo.png')) {
            seenSrcs.add(img.src);
            images.push(img);
        }
    });

    // 2. Функция обновления контента
    function updateModalContent() {
        const img = images[currentImgIdx];
        if(!img) return;
        
        modalImg.src = img.src;
        document.getElementById("modal-caption").innerHTML = img.alt || "DATA_ENTRY_IMAGE";
        
        const dlLink = document.getElementById("dl-raw");
        const exLink = document.getElementById("external-url");
        if(dlLink) dlLink.href = img.src;
        if(exLink) exLink.href = img.src;

        const tempImg = new Image();
        tempImg.src = img.src;
        tempImg.onload = function() {
            const resEl = document.getElementById("img-res");
            const sizeEl = document.getElementById("img-size");
            if(resEl) resEl.innerHTML = this.width + " x " + this.height;
            if(sizeEl) {
                let sizeMB = Math.round((this.width * this.height * 3) / 1048576 * 10) / 10;
                sizeEl.innerHTML = sizeMB + " MB (est.)";
            }
        };
    }

    // 3. Ловим клик по картинкам
    document.addEventListener('click', function (e) {
        const target = e.target.closest('img');
        if (target && !target.closest('#myModal') && !target.src.includes('my-logo.png')) {
            e.preventDefault();
            e.stopPropagation();
            
            // Находим индекс в массиве уникальных картинок
            currentImgIdx = images.findIndex(img => img.src === target.src);
            
            if (currentImgIdx !== -1) {
                modal.style.display = "flex"; 
                updateModalContent();
            }
        }
    }, true);

    // 4. Кнопки управления (ОДИН РАЗ)
    const btnNext = document.querySelector(".next");
    const btnPrev = document.querySelector(".prev");
    const btnClose = document.querySelector(".close");

    if(btnNext) {
        btnNext.onclick = (e) => {
            e.stopPropagation();
            currentImgIdx = (currentImgIdx + 1) % images.length;
            updateModalContent();
        };
    }

    if(btnPrev) {
        btnPrev.onclick = (e) => {
            e.stopPropagation();
            currentImgIdx = (currentImgIdx - 1 + images.length) % images.length;
            updateModalContent();
        };
    }

    if(btnClose) {
        btnClose.onclick = () => modal.style.display = "none";
    }

    // Закрытие при клике на фон
    if(modal) {
        modal.onclick = (e) => { 
            if (e.target === modal) modal.style.display = "none"; 
        };
    }

// Создаем элемент окна один раз при загрузке
const previewBox = document.createElement('div');
previewBox.id = 'preview-box';
document.body.appendChild(previewBox);

document.querySelectorAll('.wiki-link').forEach(link => {
    link.addEventListener('mouseenter', async (e) => {
        const pageUrl = link.getAttribute('data-page');
        const imageUrl = link.getAttribute('data-image');
        
        // Показываем заглушку, пока грузится
        previewBox.innerHTML = '<p>Загрузка...</p>';
        previewBox.style.display = 'block';
        previewBox.style.left = e.pageX + 15 + 'px';
        previewBox.style.top = e.pageY + 15 + 'px';

        try {
            // Загружаем содержимое другой страницы
            const response = await fetch(pageUrl);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            // Берем первый абзац из той страницы (селектор .main-content p)
            const description = doc.querySelector('.main-content p')?.textContent || 'Описание отсутствует';

            previewBox.innerHTML = `
                ${imageUrl ? `<img src="${imageUrl}">` : ''}
                <p>${description.substring(0, 200)}...</p>
            `;
        } catch (err) {
            previewBox.innerHTML = '<p>Не удалось загрузить предпросмотр</p>';
        }
    });

    link.addEventListener('mousemove', (e) => {
        previewBox.style.left = e.pageX + 15 + 'px';
        previewBox.style.top = e.pageY + 15 + 'px';
    });

    link.addEventListener('mouseleave', () => {
        previewBox.style.display = 'none';
    });
});

// Кэш, чтобы не скачивать одну и ту же страницу дважды
const cache = {};

document.querySelectorAll('.wiki-link').forEach(link => {
    // 1. ПОЯВЛЕНИЕ (Твой текущий код)
    link.addEventListener('mouseenter', async (e) => {
        const url = link.href;
        const manualInfo = link.getAttribute('data-info');
        const manualImg = link.getAttribute('data-image');

        previewBox.classList.add('is-visible');
         pLoader.style.display = 'block';
          pImg.style.display = 'none'; // Картинка пока скрыта, ждем загрузки
          pInfo.textContent = '';

        if (manualInfo) {
            showPreview({ text: manualInfo, img: manualImg });
            return; 
        }

        if (cache[url]) {
            showPreview(cache[url]);
        } else {
            try {
                const response = await fetch(url);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const firstParagraph = Array.from(doc.querySelectorAll('p'))
                    .find(p => p.textContent.trim().length > 10)?.textContent || "Описание отсутствует";

            // Ищем главную картинку
const firstImg = doc.querySelector('.infobox img, .thumb-left img, .thumb-right img, img');
let imgSrc = '';

if (firstImg) {
    const rawSrc = firstImg.getAttribute('src');
    
    // Если путь к картинке не полный (не начинается с http), 
    // мы склеиваем его с URL страницы, которую скачали
    if (!rawSrc.startsWith('http')) {
        // Создаем правильный абсолютный путь
        imgSrc = new URL(rawSrc, url).href;
    } else {
        imgSrc = rawSrc;
    }
}

            cache[url] = { text: firstParagraph, img: imgSrc };
            showPreview(cache[url]);
            } catch (err) {
                pInfo.textContent = "Для внешних ссылок добавьте data-info вручную";
                pLoader.style.display = 'none';
            }
        }
    });

    // 2. ДВИЖЕНИЕ (Ты это потерял!)
    link.addEventListener('mousemove', (e) => {
        previewBox.style.left = e.pageX + 15 + 'px';
        previewBox.style.top = e.pageY + 15 + 'px';
    });

    // 3. ИСЧЕЗНОВЕНИЕ (Ты это тоже потерял!)
link.addEventListener('mouseleave', () => {
    previewBox.classList.remove('is-visible');
});
});

// 4. ФУНКЦИЯ ОТРИСОВКИ (Нужна в самом конце)
function showPreview(data) {
    pLoader.style.display = 'none';
    pInfo.textContent = data.text.substring(0, 200) + '...';
    if (data.img) {
        pImg.src = data.img;
        pImg.style.display = 'block';
    } else {
        pImg.style.display = 'none';
    }
}

// --- ПРОВЕРКА КНОПКИ СОДЕРЖАНИЯ ---
const tocBtn = document.getElementById('toc-btn');
const tocContainer = document.getElementById('toc');

if (tocBtn && tocContainer) {
    console.log("Кнопка содержания найдена и готова к работе!");

    tocBtn.onclick = function() {
        // Проверка: срабатывает ли вообще клик?
        console.log("Клик по кнопке зафиксирован!");

        // Переключаем класс
        tocContainer.classList.toggle('toc-hidden');
        
        // Меняем текст
        if (tocContainer.classList.contains('toc-hidden')) {
            this.innerText = 'ПОКАЗАТЬ';
        } else {
            this.innerText = 'СКРЫТЬ';
        }
    };
} else {
    // Если в консоли (F12) появится это сообщение — значит ID в HTML неверные
    console.error("Ошибка: Элементы toc-btn или toc не найдены в HTML!");
}

const core = document.getElementById('core');
const changingText = document.getElementById('changing-text');


}); // Конец DOMContentLoaded

