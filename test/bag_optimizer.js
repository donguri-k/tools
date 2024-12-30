// ==UserScript==
// @name         donguri bag optimizer
// @version      1.1a
// @description  optimize item bag
// @author       7234e634
// @match        https://donguri.5ch.net/bag
// ==/UserScript==

(()=>{
  // 錠・解錠でページ遷移なし
  Array.from(document.querySelectorAll('td:nth-child(3) > a')).forEach(a=>{
    a.addEventListener('click', async(event)=>{
      event.preventDefault();
      const response = await fetch(a.href,{method:'GET'});
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text,'text/html');
      const h1 = doc.querySelector('h1');
      if(h1.textContent === 'アイテムバッグ'){
        if(a.href.includes('https://donguri.5ch.net/lock/')){
          a.href = a.href.replace('/lock/','/unlock/');
          a.textContent = '[解錠]';
        } else if (a.href.includes('https://donguri.5ch.net/unlock/')){
          a.href = a.href.replace('/unlock/','/lock/');
          a.textContent = '[錠]';
        }
      } else {
        alert('failed');
      }
    })
  })

  // アイテム名クリックで同名を検索・解除
  const weaponTable = document.querySelector('#weaponTable');
  const armorTable = document.querySelector('#armorTable');

  let currentFilter = null;
  let scrollPosition = 0;

  function tableFilter(table){
    table.addEventListener('click', (event) => {
      const cell = event.target.closest('td');
      if (!cell || cell.cellIndex !== 0) return;

      const filterText = cell.textContent;
      const rows = table.querySelectorAll('tbody tr');

      // フィルタ解除
      if (currentFilter === filterText) {
        rows.forEach((row) => (row.style.display = ''));
        currentFilter = null;
        window.scrollTo({top: scrollPosition, behavior: 'instant'})
        return;
      }

      // scroll記憶
      scrollPosition = window.scrollY;

      // フィルタ適用
      rows.forEach((row) => {
        const itemName = row.cells[0].textContent;
        row.style.display = itemName === filterText ? '' : 'none';
      });
      currentFilter = filterText;

      table.scrollIntoView({behavior: 'instant'});
    });
  }

  tableFilter(weaponTable);
  tableFilter(armorTable);

  // アイテムのNo.を表示
  const style = document.createElement('style');
  style.textContent = `
    table {
      counter-reset: row-number -1;
      border-collapse: collapse;
      width: 100%;
    }
    tr {
      counter-increment: row-number;
    }
    td:first-child::before {
      content: counter(row-number);
      position: absolute;
      pointer-events: none;
      color: #333;
      background: #acc;
      font-size: 10px;
      font-weight: bold;
      margin: -10px;
      width: 24px;
      text-align: right;
      padding-right: 2px;
    }
    `;
  document.head.append(style);
})();