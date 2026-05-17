let books = document.querySelectorAll('.book');
for (let book of books) {
	let pages = book.getElementsByClassName('bookpage');
	let size = pages.length;
	for (let i = 0, page; page = pages[i]; ++i) {
		if (i % 2 === 0) page.style.zIndex = (size - i);
	}
	book.onclick = function(e) {
		if (e.target == e.currentTarget) { // unroll book in mobile mode
			e.target.classList.toggle('unrolled');
		} else {
			e.currentTarget.classList.remove('unrolled');
			let pagearray = [...e.target.parentElement.children];
			let pagenum = pagearray.indexOf(e.target);
			e.target.classList.remove('clickable');
			if (pagenum & 1) { // odd pages (flip back)
				e.target.classList.remove('flipped');
				e.target.previousElementSibling.classList.remove('flipped');
				e.target.nextElementSibling.classList.remove('clickable');
				if (pagenum > 1) {
					e.target.previousElementSibling.classList.add('clickable');				
					e.target.previousElementSibling.previousElementSibling.classList.add('clickable');
				} else {
					e.target.parentElement.classList.remove('opened');
				}
			} else if (pagenum === (pagearray.length-1)) { // last page (close book)
				for (let i = pagenum; i >= 0; --i) {
					pagearray[i].classList.remove('flipped');
				}
				e.target.parentElement.classList.remove('opened');					
			} else { // even pages (flip forward)
				if (pagenum === 0) { // first page (open book)
					e.target.parentElement.classList.add('opened');
				} else {
					e.target.previousElementSibling.classList.remove('clickable');
				}
				e.target.classList.add('flipped');
				e.target.nextElementSibling.classList.add('flipped');
				e.target.nextElementSibling.classList.add('clickable');				
				e.target.nextElementSibling.nextElementSibling.classList.add('clickable');
			}
		}
		e.stopPropagation();
	}
}

function jumpToPage(book, targetPageNum) {
  const pages = [...book.getElementsByClassName('bookpage')];
  const total = pages.length;

  if (targetPageNum < 0 || targetPageNum >= total) return;

  // 1. Full reset
  book.classList.remove('opened', 'unrolled');
  pages.forEach(p => p.classList.remove('flipped', 'clickable'));

  // 2. Re-apply z-index (mirrors initial setup — only even pages)
  pages.forEach((p, i) => {
    if (i % 2 === 0) p.style.zIndex = total - i;
  });

  if (targetPageNum === 0) return; // page 0 = cover, book stays closed

  // 3. Open the book
  book.classList.add('opened');

  // 4. Normalise to the even page of the target spread
  //    Even pages are the "front" of each leaf. If user picks an odd page,
  //    we show the spread that contains it (the even page before it).
  const evenPage = targetPageNum % 2 === 0 ? targetPageNum : targetPageNum - 1;

  // 5. Flip every page BEFORE the target spread
  for (let i = 0; i < evenPage; i++) {
    pages[i].classList.add('flipped');
  }

  // 6. Set clickable state to exactly match what the click handler produces
  //    after a forward flip to this spread:
  //    - the odd page of this spread (nextElementSibling after even flip) = evenPage + 1
  //    - the next even page (nextElementSibling.nextElementSibling)       = evenPage + 2
  //    - the previous even page (for going back)                          = evenPage - 1
  const oddPage  = evenPage + 1;   // right-hand leaf of current spread (go back)
  const nextEven = evenPage + 2;   // next leaf to flip forward
  const prevEven = evenPage - 1;   // previous leaf to flip back further

  if (oddPage < total)            pages[oddPage].classList.add('clickable');
  if (nextEven < total - 1)       pages[nextEven].classList.add('clickable');
  if (prevEven > 0)               pages[prevEven].classList.add('clickable');
}

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

    book.insertAdjacentElement('afterend', strip);

    strip.querySelector('button').addEventListener('click', () => {
      const input = strip.querySelector('input');
      const requested = parseInt(input.value, 10);
      if (isNaN(requested)) return;
      jumpToPage(book, requested - 1);
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
