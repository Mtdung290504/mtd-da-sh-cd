const liList = document.querySelectorAll('ol li');
const input = document.querySelector('input');

input.addEventListener('input', debounce(find, 200));

document.querySelector('button').addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
});

function find(event) {
  const value = normalize(event.target.value).trim();
  
  if(value.length <= 0) {
    liList.forEach(li => {
      const [qstBox, aswBox] = ['qst', 'asw'].map(cls => li.querySelector('.' + cls));
      li.style.display = 'list-item';
      rHighlight(qstBox, aswBox);
    });
    
    return;
  }
  
  liList.forEach(li => {
    const qstBox = li.querySelector('.qst'),
          aswBox = li.querySelector('.asw');
    const normalizedQst = normalize(qstBox.textContent),
          normalizedAsw = normalize(aswBox.textContent);

    if (normalizedQst.includes(value) || normalizedAsw.includes(value)) {
      if(li.style.display != 'list-item') li.style.display = 'list-item';
      if(normalizedQst.includes(value)) {
        const qstStart = normalizedQst.indexOf(value),
              qstEnd = qstStart + value.length;
        const replaceValue = qstBox.textContent.slice(qstStart, qstEnd);
        qstBox.innerHTML = qstBox.innerHTML.replaceAll('<span class="highlight">', '')
          .replaceAll('</span>', '').replaceAll(replaceValue, `<span class="highlight">${replaceValue}</span>`);                
      } else {
        qstBox.innerHTML = qstBox.innerHTML.replaceAll('<span class="highlight">', '').replaceAll('</span>', '');
      }
      if(normalizedAsw.includes(value)) {
        const aswStart = normalizedAsw.indexOf(value),
              aswEnd = aswStart + value.length;
        const replaceValue = aswBox.textContent.slice(aswStart, aswEnd);
        aswBox.innerHTML = aswBox.innerHTML.replaceAll('<span class="highlight">', '')
          .replaceAll('</span>', '').replaceAll(replaceValue, `<span class="highlight">${replaceValue}</span>`);
      } else {
        aswBox.innerHTML = aswBox.innerHTML.replaceAll('<span class="highlight">', '').replaceAll('</span>', '');
      }
    } else {
      if(li.style.display != 'none') li.style.display = 'none';
      rHighlight(qstBox, aswBox);
    }
  });
}

function debounce(func, delay) {
  let timeoutId;

  return function() {
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

function rHighlight(...elements) {
  elements.forEach(ele => {
    ele.innerHTML = ele.innerHTML
      .replaceAll('<span class="highlight">', '')
      .replaceAll('</span>', '');
  });
}