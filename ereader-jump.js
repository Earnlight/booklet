// ── Jump-to-page feature ──────────────────────────────────────────────────────
// Drop this beneath your existing e-reader code.
// It works by replicating the same flipped/clickable/opened class logic
// that the click handler uses, but for any arbitrary target page.

function jumpToPage(book, targetPageNum) {
  const pages = [...book.getElementsByClassName('bookpage')];
  const total = pages.length;

  if (targetPageNum < 0 || targetPageNum >= total) return; // out of range guard

  // 1. Reset everything to closed state
  book.classList.remove('opened', 'unrolled');
  pages.forEach(p => p.classList.remove('flipped', 'clickable'));

  // 2. Re-apply z-index (mirrors the initial setup)
  pages.forEach((p, i) => {
    if (i % 2 === 0) p.style.zIndex = total - i;
  });

  if (targetPageNum === 0) return; // page 0 = closed book, we're done

  // 3. Open the book
  book.classList.add('opened');

  // 4. Flip all pages up to (but not past) the target spread.
  //    Pages are in pairs: (0,1), (2,3), (4,5) …
  //    To show page N we need all pairs whose even index < targetPageNum flipped.
  //    The "current spread" is the pair that contains targetPageNum.
  const spreadStart = targetPageNum % 2 === 0 ? : targetPageNum;
  // spreadStart is the odd page of the visible spread (right-hand leaf)

  for (let i = 0; i < spreadStart; i++) {
    pages[i].classList.add('flipped');
  }

  // 5. Restore clickable state for the visible spread edges
  //    — the currently visible odd page (go back)
  if (spreadStart < total) {
    pages[spreadStart].classList.add('clickable');
  }
  //    — the next even page (go forward), if it exists and isn't the last
  const nextEven = spreadStart + 1;
  if (nextEven < total - 1) {
    pages[nextEven].classList.add('clickable');
  }
  //    — the previous even page (go further back), if we're past the first spread
  const prevEven = spreadStart - 1;
  if (prevEven > 0) {
    pages[prevEven].classList.add('clickable');
  }
}


// ── UI: input + button rendered above each book ───────────────────────────────
// Builds a small control strip for every .book on the page.

function buildJumpControls() {
  const books = document.querySelectorAll('.book');

  books.forEach((book, bookIndex) => {
    const pageCount = book.getElementsByClassName('bookpage').length;

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

    // Insert the strip directly before the book in the DOM
    book.parentElement.appendChild(strip);

    strip.querySelector('button').addEventListener('click', () => {
      const input = strip.querySelector('input');
      const requested = parseInt(input.value, 10);
      if (isNaN(requested)) return;
      // User-facing pages are 1-based; internal indices are 0-based
      jumpToPage(book, requested - 1);
    });

    // Also trigger on Enter key inside the input
    strip.querySelector('input').addEventListener('keydown', e => {
      if (e.key === 'Enter') strip.querySelector('button').click();
    });
  });
}

buildJumpControls();


// ── Minimal styles for the control strip ─────────────────────────────────────
// Paste these into your stylesheet, or let the script inject them.

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
  .jump-strip label {
    font-weight: 500;
    white-space: nowrap;
  }
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
  .jump-strip button:hover {
    background: #e0e0e0;
  }
  .jump-hint {
    color: #888;
    white-space: nowrap;
  }

  
`;
document.head.appendChild(jumpStyles);
