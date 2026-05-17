function jumpToPage(book, targetPageNum) {
  const pages = [...book.getElementsByClassName('bookpage')];
  const total = pages.length;

  book.classList.remove('opened', 'unrolled');
  pages.forEach(p => p.classList.remove('flipped', 'clickable'));
  pages.forEach((p, i) => {
    if (i % 2 === 0) p.style.zIndex = total - i;
  });

  if (targetPageNum <= 0) return;

  book.classList.add('opened');

  const targetIndex = targetPageNum + 2;
  const evenIndex = targetIndex % 2 === 0 ? targetIndex : targetIndex + 1;

  // Debug display
  const debug = document.getElementById('jump-debug');
  alert(`input=${targetPageNum} | targetIndex=${targetIndex} | evenIndex=${evenIndex} | flipping 0–${evenIndex-1}`);


  for (let i = 0; i < evenIndex; i++) {
    pages[i].classList.add('flipped');
  }

  const oddPage  = evenIndex + 1;
  const nextEven = evenIndex + 2;
  const prevEven = evenIndex - 1;

  if (oddPage < total)       pages[oddPage].classList.add('clickable');
  if (nextEven < total - 1)  pages[nextEven].classList.add('clickable');
  if (prevEven > 0)          pages[prevEven].classList.add('clickable');
}

function buildJumpControls() {
  const books = document.querySelectorAll('.book');

  // Debug box
  const debugBox = document.createElement('div');
  debugBox.id = 'jump-debug';
  debugBox.style.cssText = 'position:fixed;top:0;left:0;right:0;background:black;color:lime;font-family:monospace;font-size:14px;padding:8px;z-index:9999;';
  debugBox.textContent = 'Jump debug ready';
  document.body.prepend(debugBox);

  books.forEach((book, bookIndex) => {
    const pageCount = book.getElementsByClassName('bookpage').length - 2;

    const strip = document.createElement('div');
    strip.className = 'jump-strip';
    strip.innerHTML = `
      <label for="jump-input-${bookIndex}">Go to page</label>
      <input
        id="jump-input-${bookIndex}"
        type="number"
        min="1"
        max="${pageCount}"
        placeholder="1–${pageCount}"
        aria-label="Page number"
      />
      <button type="button" data-book-index="${bookIndex}">Jump</button>
      <span class="jump-hint">of ${pageCount}</span>
    `;

    book.insertAdjacentElement('afterend', strip);

    strip.querySelector('button').addEventListener('click', () => {
      const input = strip.querySelector('input');
      const requested = parseInt(input.value, 10);
      if (isNaN(requested)) return;
      jumpToPage(book, requested);
    });

    strip.querySelector('input').addEventListener('keydown', e => {
      if (e.key === 'Enter') strip.querySelector('button').click();
    });
  });
}

buildJumpControls();

const jumpStyles = document.createElement('style');
jumpStyles.textContent = `
  .jump-strip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    font-family: inherit;
    font-size: 0.875rem;
  }
  .jump-strip label { font-weight: 500; white-space: nowrap; }
  .jump-strip input {
    width: 5rem;
    padding: 0.25rem 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.875rem;
    text-align: center;
  }
  .jump-strip button {
    padding: 0.25rem 0.75rem;
    border: 1px solid #888;
    border-radius: 4px;
    background: #f5f5f5;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.15s;
  }
  .jump-strip button:hover { background: #e0e0e0; }
  .jump-hint { color: #888; white-space: nowrap; }
`;
document.head.appendChild(jumpStyles);
