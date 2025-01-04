// ==UserScript==
// @name         donguri Arena Improver
// @version      0.7c
// @description  fix arena ui
// @author       7234e634
// @match        https://donguri.5ch.net/teambattle
// ==/UserScript==


(()=>{
  const topbar = document.createElement('div');
  topbar.style.width = '100%';
  topbar.style.height = '48px';
  topbar.style.background = '#fff';
  topbar.style.position = 'fixed';
  topbar.style.top = '0';
  topbar.style.border = 'solid 1px #000';
  topbar.style.textAlign = 'right';

  const cellButton = document.createElement('button');
  cellButton.textContent = '詳細取得/更新';
  cellButton.addEventListener('click',getArenaInfo);
  cellButton.style.marginLeft = '2px';

  const refreshButton = document.createElement('button');
  refreshButton.textContent = '陣地更新';
  refreshButton.addEventListener('click',refreshAreaInfo);
  refreshButton.style.marginLeft = '2px';

  topbar.append(refreshButton, cellButton);
  document.body.append(topbar);

  const grid = document.querySelector('.grid');
  grid.parentNode.style.height = null;
  grid.style.maxWidth = '100%';
  function refreshAreaInfo(){
    fetch('')
    .then(res => res.ok?res.text() : Promise.reject('res.ng'))
    .then(text => {
      const doc = new DOMParser().parseFromString(text,'text/html');
      const h1 = doc?.querySelector('h1')?.textContent;
      if(h1 !== 'どんぐりチーム戦い') return Promise.reject(`title.ng info`);
      const currentCells = grid.querySelectorAll('.cell');
      const scriptContent = doc.querySelector('.grid > script').textContent;

      const cellColorsString = scriptContent.match(/const cellColors = ({.+?})/s)[1];
      const validJsonStr = cellColorsString.replace(/'/g, '"').replace(/,\s*}/, '}');
      const cellColors = JSON.parse(validJsonStr);
      if(currentCells.length !== Object.keys(cellColors).length){
        const newGrid = doc.querySelector('.grid');
        grid.style.gridTemplateRows = newGrid.style.gridTemplateRows;
        grid.style.gridTemplateColumns = newGrid.style.gridTemplateColumns;
        grid.innerHTML = '';
        const len = Math.sqrt(Object.keys(cellColors).length);
        for (let i = 0; i < len; i++) {
          for (let j = 0; j < len; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.style.width = '30px';
            cell.style.height = '30px';
            cell.style.border = '1px solid #ccc';
            cell.style.cursor = 'pointer';
            cell.style.transition = 'background-color 0.3s';
            const cellKey = `${i}-${j}`;
            if (cellColors[cellKey]) {
              cell.style.backgroundColor = cellColors[cellKey];
            } else {
              cell.style.backgroundColor = '#ffffff00';
            }
            grid.appendChild(cell);
          }
        }
      } else {
        currentCells.forEach(cell => {
          const row = cell.dataset.row;
          const col = cell.dataset.col;
          const cellKey = `${row}-${col}`;
          cell.style.backgroundColor = cellColors[cellKey];
          const rgb = cell.style.backgroundColor.match(/\d+/g);
          const brightness = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
          cell.style.color = brightness > 128 ? '#000' : '#fff';
        })
      }

      const tables = document.querySelectorAll('table');
      const newTables = doc.querySelectorAll('table');
      newTables.forEach((table,i) => {
        tables[i].replaceWith(table);
      })

    })
  }
  async function getArenaInfo(){
    await refreshAreaInfo();
    let br = document.createElement('br');
    grid.style.gridTemplateRows = grid.style.gridTemplateRows.replace('35px','65px'),
    grid.style.gridTemplateColumns = grid.style.gridTemplateColumns.replace('35px','105px'),
    grid.parentNode.style.height = null,
    grid.parentNode.style.padding = '20px 0',
    [...document.querySelectorAll('.cell')].forEach((elm)=>{
      let row = elm.dataset.row,
      col = elm.dataset.col,
      url = `https://donguri.5ch.net/teambattle?r=${row}&c=${col}`;
      return fetch(url)
      .then(res=>
        res.ok?res.text():Promise.reject('res.ng')
      )
      .then(text=>{
        let doc = new DOMParser().parseFromString(text,'text/html'),
        h1 = doc?.querySelector('h1')?.textContent;
        if(h1 !== 'どんぐりチーム戦い') return Promise.reject(`title.ng [${row}][${col}][${h1}]`);
        let cond = doc.querySelector('small')?.textContent;
        if(!cond) return Promise.reject(`cond.ng [${row}][${col}][${h1}]`);
        console.log(cond);
        let holder = doc.querySelector('strong').textContent,
        shortenCond = cond.replace('| [エリート]','e').replace('から','-').replace(/(まで|\[|\]|\||\s)/g,''),
        cell = elm.cloneNode();
        cell.append(shortenCond,br.cloneNode(),holder),
        cell.style.overflow = 'hidden',
        cell.style.width = '100px',
        cell.style.height = '60px',
        cell.style.borderWidth = '3px';
        cell.onclick=()=>{open(url,'_blank')},elm.replaceWith(cell)}
      )
      }
    )
  }
})();
