// ==UserScript==
// @name         donguri Arena Improver
// @version      0.9c
// @description  fix arena ui
// @author       7234e634
// @match        https://donguri.5ch.net/teambattle
// ==/UserScript==


(()=>{
  const vw = Math.min(document.documentElement.clientWidth, window.innerWidth || 0);

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

  const sortSelect = document.createElement('select');
  sortSelect.style.maxWidth = '128px';
  let lastSelectedValue = sortSelect.value;

  (()=>{
    const option1 = document.createElement('option');
    const option2 = document.createElement('option');
    option1.textContent = 'デフォルト順';
    option2.textContent = '装備制限順';
    option1.value = 'default';
    option2.value = 'cond';
    sortSelect.append(option1,option2);

    sortSelect.addEventListener('change', handleSelection);

    // 再選択を可能にする
    sortSelect.addEventListener('focus', () => lastSelectedValue = null);
    sortSelect.addEventListener('mousedown', handleSelection);
    sortSelect.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') handleSelection();
    });
    function handleSelection() {
      const currentValue = sortSelect.value;
      if (lastSelectedValue !== currentValue || lastSelectedValue === null) {
        sortCells(currentValue);
        lastSelectedValue = currentValue;
      }
    }
  })();

  const arenaField = document.createElement('dialog');
  arenaField.style.position = 'fixed';
  arenaField.style.width = '100%';
  arenaField.style.bottom = '10px';
  arenaField.style.height = '320px';
  arenaField.style.background = '#fff';
  arenaField.style.color = '#000';
  arenaField.style.border = 'solid 1px #000';
  arenaField.style.margin = '0';
  (()=>{
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '4px';
    closeButton.style.right = '4px';
    closeButton.style.fontSize = '18px';
    closeButton.style.width = '36px';
    closeButton.style.height = '36px';
    closeButton.style.lineHeight = '36px';
    closeButton.style.padding = '0';

    closeButton.addEventListener('click', ()=>{arenaField.close()});
    const table = document.createElement('table');
    arenaField.append(closeButton,table);
  })();

  const arenaResult = document.createElement('dialog');
  arenaResult.style.position = 'fixed';
  arenaResult.style.width = '50%';
  arenaResult.style.bottom = '10px';
  arenaResult.style.left = 'auto';
  arenaResult.style.height = '640px';
  arenaResult.style.background = '#fff';
  arenaResult.style.color = '#000';
  arenaResult.style.fontSize = '80%';
  arenaResult.style.border = 'solid 1px #000';
  arenaResult.style.margin = '0';
  arenaResult.style.textAlign = 'left';
  arenaResult.style.overflowY = 'auto';
  window.addEventListener('click', (event) => {
    if (!arenaResult.contains(event.target)) {
      arenaResult.close();
    }
  });
  arenaField.append(arenaResult);
  (()=>{
    if (vw < 768) {
      sortSelect.style.fontSize = '60%';
      cellButton.style.fontSize = '60%';
      refreshButton.style.fontSize = '60%';
    }
    const div = document.createElement('div');
    div.style.display = 'inline-block';
    div.append(refreshButton, cellButton);
    topbar.append(sortSelect, div);
  })();
  document.body.append(topbar,arenaField);

  const grid = document.querySelector('.grid');
  grid.parentNode.style.height = null;
  grid.style.maxWidth = '100%';

  const table = document.querySelector('table');
  table.parentNode.style.maxWidth = '100%';
  table.parentNode.style.overflow = 'auto';
  table.parentNode.style.height = '60vh';

  function scaleContentsToFit(container, contents){
    const containerWidth = container.clientWidth;
    const contentsWidth = contents.scrollWidth;
    const scaleFactor = Math.min(1, containerWidth / contentsWidth);
    contents.style.transform = `scale(${scaleFactor})`;
    contents.style.transformOrigin = 'top left';

    const scaledHeight = contents.scrollHeight * scaleFactor;
  
    contents.style.height = `${scaledHeight}px`;
  }

  scaleContentsToFit(grid.parentNode, grid);

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

      const newGrid = doc.querySelector('.grid');
      const rows = Number(newGrid.style.gridTemplateRows.match(/repeat\((\d+), 35px\)/)[1]);
      const cols = Number(newGrid.style.gridTemplateColumns.match(/repeat\((\d+), 35px\)/)[1]);
      if(currentCells.length !== (rows * cols)){
        grid.style.gridTemplateRows = newGrid.style.gridTemplateRows;
        grid.style.gridTemplateColumns = newGrid.style.gridTemplateColumns;
        grid.innerHTML = '';
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
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
          if(cellColors[cellKey]) {
            cell.style.backgroundColor = cellColors[cellKey];
          } else {
            cell.style.backgroundColor = 'rgb(255,255,255,0)';
          }
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
    }).catch(e=>console.error(e))
  }
  async function getArenaInfo(){
    await refreshAreaInfo();
    grid.style.gridTemplateRows = grid.style.gridTemplateRows.replace('35px','65px'),
    grid.style.gridTemplateColumns = grid.style.gridTemplateColumns.replace('35px','105px'),
    grid.parentNode.style.height = null,
    grid.parentNode.style.padding = '20px 0';
    const cols = Number(grid.style.gridTemplateColumns.match(/repeat\((\d+),/)[1]);
    if (vw < 768 && cols > 8) {
      grid.style.gridTemplateColumns = 'repeat(8, 105px)';
    }

    [...document.querySelectorAll('.cell')].forEach((elm)=>{
      let row = elm.dataset.row,
      col = elm.dataset.col,
      url = `https://donguri.5ch.net/teambattle?r=${row}&c=${col}`;
      fetch(url)
      .then(res=>
        res.ok?res.text():Promise.reject('res.ng')
      )
      .then(text => {
        let doc = new DOMParser().parseFromString(text,'text/html'),
        h1 = doc?.querySelector('h1')?.textContent;
        if(h1 !== 'どんぐりチーム戦い') return Promise.reject(`title.ng [${row}][${col}][${h1}]`);
        let cond = doc.querySelector('small')?.textContent || '';
        if(!cond) return Promise.reject(`cond.ng [${row}][${col}][${h1}]`);
        let holder = doc.querySelector('strong')?.textContent || '',
        shortenCond = cond.replace('[エリート]','e').replace('から','-').replace(/(まで|\[|\]|\||\s)/g,'');
        const p = [document.createElement('p'), document.createElement('p')];
        p[0].textContent = shortenCond;
        p[1].textContent = holder;
        p[0].style.margin = '0';
        p[1].style.margin = '0';
        cell = elm.cloneNode();
        cell.append(p[0],p[1]),
        cell.style.overflow = 'hidden',
        cell.style.width = '100px',
        cell.style.height = '60px',
        cell.style.borderWidth = '3px';
        cell.addEventListener('click', ()=>{
          fetch(url)
          .then(res => res.ok?res.text():Promise.reject('res.ng'))
          .then(text => {
            const doc = new DOMParser().parseFromString(text,'text/html');
            const h1 = doc?.querySelector('h1')?.textContent;
            if(h1 !== 'どんぐりチーム戦い') return Promise.reject(`title.ng`);
            const table = doc.querySelector('table');
            if(!table) return Promise.reject(`table.ng`);
            table.style.marginLeft = '-16px';
            arenaField.querySelector('table').replaceWith(table);
            scaleContentsToFit(arenaField,table);
            const forms = table.querySelectorAll('form');
            forms[0].addEventListener('submit', (event) => {
              event.preventDefault();
              const formData = new FormData(forms[0]);
              arenaChallenge(formData);
            })
            forms[1].target = '_blank';
            forms[2].target = '_blank';
          })
          arenaField.show();
        });
        elm.replaceWith(cell);
      })
      .catch(e=>console.error(e))
    })
  }

  const observer = new MutationObserver(() => {
    scaleContentsToFit(grid.parentNode, grid);
  });
  
  observer.observe(grid, { attributes: true, childList: true, subtree: true });

  async function arenaChallenge (formData){
    const options = {
      method: 'POST',
      body: formData,
    };
    try {
      const response = await fetch('/teamchallenge', options);
      if(!response.ok){
        throw new Error('/teamchallenge res.ng');
      }
      let text = await response.text();
      if(text.includes('\n')) {
        const lastLine = text.trim().split('\n').pop();
        text = lastLine + '\n' + text;
      }
      arenaResult.innerText = text;
      arenaResult.show();
    } catch (e) {
      arenaResult.innerText = e;
      arenaResult.show();
    }

  }
  function sortCells(type){
    const cells = [...document.querySelectorAll('.cell')];
    if(type === 'default') {
      cells.sort((a, b) => {
        const rowA = a.dataset.row;
        const rowB = b.dataset.row;
        const colA = a.dataset.col;
        const colB = b.dataset.col;
        return rowA - rowB || colA - colB;
      })
    }

    if(type === 'cond') {
      cells.sort((a, b) => {
        const condA = a.querySelector('p')?.textContent;
        const condB = b.querySelector('p')?.textContent;
        if(!condA || !condB) return;
        const splitA = condA.split('-');
        const splitB = condB.split('-');
        
        const isCompositeA = splitA.length > 1;
        const isCompositeB = splitB.length > 1;
        
        const order = ['N','R','SR','SSR','UR'];
        // '-'を含むものを後 
        if (isCompositeA !== isCompositeB) return isCompositeA - isCompositeB;
        if (isCompositeA) {
          // 後のランク優先で比較
          const backA = splitA[1];
          const backB = splitB[1];
          const indexBackA = order.indexOf(backA);
          const indexBackB = order.indexOf(backB);
          if (indexBackA !== indexBackB) return indexBackA - indexBackB;
          
          const frontA = splitA[0];
          const frontB = splitB[0];
          const indexFrontA = order.indexOf(frontA);
          const indexFrontB = order.indexOf(frontB);
          return indexFrontA - indexFrontB;
        }
        // 単一
        const baseA = condA.replace(/だけ|e/g, '');
        const baseB = condB.replace(/だけ|e/g, ''); 
        const indexA = order.indexOf(baseA);
        const indexB = order.indexOf(baseB);
        
        if (indexA !== indexB) return indexA - indexB;
        
        const flag = s => 
          (s.includes('だけ') ? 1 : 0) + (s.includes('e') ? 2 : 0);
        
        return flag(condA) - flag(condB);
      });
    }
    grid.innerHTML = '';
    cells.forEach(cell => grid.append(cell));
  }
})();
