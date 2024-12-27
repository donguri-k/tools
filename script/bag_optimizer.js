// ==UserScript==
// @name         donguri bag optimizer
// @version      1.0a
// @description  donguri bag
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
  function tableFilter(table){
    table.addEventListener('click', (event) => {
      const cell = event.target;
      if (cell.tagName !== 'TD' || cell.cellIndex !== 0) return;
  
      const filterText = cell.textContent;
      const rows = table.querySelectorAll('tbody tr');

      // フィルタ解除
      if (currentFilter === filterText) {
        rows.forEach((row) => (row.style.display = ''));
        currentFilter = null;
        return;
      }
  
      // 新しいフィルタを適用
      rows.forEach((row) => {
        const itemName = row.cells[0].textContent;
        row.style.display = itemName === filterText ? '' : 'none';
      });
      currentFilter = filterText;
    });
  }
    
  tableFilter(weaponTable);
  tableFilter(armorTable);
})();