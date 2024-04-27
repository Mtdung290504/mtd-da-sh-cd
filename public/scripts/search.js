const liList = document.querySelectorAll('ol li');
const liList2 = Array.from(document.querySelectorAll('ol li')).map(li => {
  const [qst, asw] = ['qst', 'asw'].map(cls => li.querySelector('.' + cls));
  const [normalizedQst, normalizedAsw] = [qst, asw].map(element => normalize(element.textContent));
  return { li, qst, asw, normalizedQst, normalizedAsw };
});
const input = document.querySelector('input');

input.addEventListener('input', debounce(find, 200));

document.querySelector('button').addEventListener('click', () => {
  input.value = '';
  input.dispatchEvent(new Event('input'));
});

function find(event) {
  const value = normalize(event.target.value).trim();

  if (value.length <= 0) {
    liList2.forEach(({ li, qst, asw }) => {
      li.style.display = 'list-item';
      rHighlight(qst, asw);
    });

    return;
  }

  liList2.forEach(({ li, qst, asw, normalizedQst, normalizedAsw }) => {
    if (normalizedQst.includes(value) || normalizedAsw.includes(value)) {
      if (li.style.display != 'list-item') li.style.display = 'list-item';
      const elementsToHighlight = [qst, asw];

      [normalizedQst, normalizedAsw].forEach((textToSearch, index) => {
        if (textToSearch.includes(value)) {
          const start = textToSearch.indexOf(value),
            end = start + value.length;
          highlight(elementsToHighlight[index], elementsToHighlight[index].textContent.slice(start, end));
        } else {
          rHighlight(elementsToHighlight[index]);
        }
      });

      return;
    }

    if (li.style.display != 'none') li.style.display = 'none';
    rHighlight(qst, asw);
  });
}

function debounce(func, delay) {
  let timeoutId;

  return function () {
    const context = this,
      args = arguments;

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

function normalize(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function highlight(element, textToHighlight) {
  rHighlight(element);
  element.innerHTML = element.innerHTML.replaceAll(textToHighlight, `<span class="highlight">${textToHighlight}</span>`);
}

function rHighlight(...elements) {
  elements.forEach(ele => {
    ele.innerHTML = ele.innerHTML
      .replaceAll('<span class="highlight">', '')
      .replaceAll('</span>', '');
  });
}