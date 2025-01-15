// ==UserScript==
// @name         donguri arena assist tool
// @version      1.0a
// @description  fix arena ui and add functions
// @author       7234e634
// @match        https://donguri.5ch.net/teambattle
// ==/UserScript==


(()=>{
  const vw = Math.min(document.documentElement.clientWidth, window.innerWidth || 0);

  const header = document.querySelector('header');
  const customMenu = document.createElement('div');
  customMenu.style.position = 'fixed';
  customMenu.style.top = '0';
  customMenu.style.zIndex = '1';
  customMenu.style.background = '#fff';
  customMenu.style.border = 'solid 1px #000';
  customMenu.style.marginLeft = '-8px';
  header.querySelector('h4').style.display = 'none';
  header.append(customMenu);
  const progressBarContainer = document.createElement('div');
  customMenu.append(progressBarContainer);

  const sortSelect = document.createElement('select');
  sortSelect.style.maxWidth = '128px';
  let lastSelectedValue = sortSelect.value;

  // sort options 
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
  arenaField.style.marginLeft = '1px';
  if(vw > 768) {
    arenaField.style.maxWidth = '50vw';
  }
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
  arenaResult.style.height = '80vh';
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

  // add buttons and select to custom menu
  (()=>{
    const button = document.createElement('button');
    button.type = 'button';
    button.style.flexShrink = '1';
    button.style.flexGrow = '0';
    button.style.whiteSpace = 'nowrap';
    button.style.overflow = 'hidden';
    button.style.boxSizing = 'border-box';

    if (vw < 768) {
      sortSelect.style.fontSize = '60%';
      button.style.fontSize = '60%';
      progressBarContainer.style.fontSize = '60%';
    }

    const equipButton = button.cloneNode();
    equipButton.textContent = '■装備';
    equipButton.addEventListener('click',()=>{panel.style.display='flex'});
  
    const cellButton = button.cloneNode();
    cellButton.textContent = '詳細取得/更新';
    cellButton.addEventListener('click',getArenaInfo);
  
    const refreshButton = button.cloneNode();
    refreshButton.textContent = '陣地更新';
    refreshButton.addEventListener('click',refreshAreaInfo);


    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.flexWrap = 'nowrap';
    div.style.gap = '2px';
    div.style.justifyContent = 'center';
    div.append(sortSelect, equipButton, refreshButton, cellButton);
    customMenu.append(div);
  })();
  document.body.append(arenaField);
  
  const grid = document.querySelector('.grid');
  grid.parentNode.style.height = null;
  grid.style.maxWidth = '100%';

  const table = document.querySelector('table');
  table.parentNode.style.maxWidth = '100%';
  table.parentNode.style.overflow = 'auto';
  table.parentNode.style.height = '60vh';

  //-- 装備 --//
  const panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.top = '0';
  panel.style.right = '0';
  panel.style.background = '#f0f0f0';
  panel.style.border = 'solid 1px #000';
  panel.style.height = '100vh';
  panel.style.width = '400px';
  panel.style.maxWidth = '80vw';
  panel.style.padding = '2px';
  panel.style.zIndex = '1';
  panel.style.textAlign = 'left';
  panel.style.display = 'none';
  panel.style.flexDirection = 'column';
  (()=>{
    let currentEquip = [];

    const input = document.createElement('input');
    const button = document.createElement('button');
    // input.style.width = '100%';
    // input.style.boxSizing = 'border';
    // input.style.background = '#eee';
    // input.style.color = '#000';
    // input.style.borderRadius = 'unset';
    // input.placeholder = 'フィルタ…';
    button.type = 'button';
    button.style.borderRadius = 'unset';
    button.style.border = 'solid 1px #000';
    button.style.background = '#ccc';
    button.style.color = '#000';
    button.style.margin = '2px';

    let currentMode = 'equip';
    const presetList = document.createElement('ul');
    presetList.style.listStyle = 'none';
    presetList.style.margin = '0';
    presetList.style.padding = '0';
    presetList.style.borderTop = 'solid 1px #000';
    presetList.style.overflowY = 'auto';
    presetList.style.flexGrow = '1';
    showEquipPreset();

    presetList.addEventListener('click', (event)=>{
      const presetLi = event.target.closest('li');
      if(!presetLi) return;
      const presetName = presetLi.querySelector('span').textContent;
      if(currentMode === 'equip') {
        setPresetItems(presetName);
      } else if (currentMode === 'remove') {
        removePresetItems(presetName);
      } else if (currentMode === 'edit') {
        alert('未実装');
      }
    });

    (()=>{
      const div = document.createElement('div');
      div.style.marginTop = '2px';
      div.style.lineHeight = 'normal';
  
      const closeButton = button.cloneNode();
      closeButton.textContent = '×';
      closeButton.style.position = 'absolute';
      closeButton.style.height = '32px';
      closeButton.style.width = '32px';
      closeButton.style.top = '2px';
      closeButton.style.right = '2px';
      closeButton.style.lineHeight = '16px';
      closeButton.addEventListener('click', ()=>{
        panel.style.display = 'none';
      })
  
      const addButton = button.cloneNode();
      addButton.textContent = '追加';
      addButton.addEventListener('click', async()=>{
        selectedEquips = {id:[], rank:[]};
        addButton.disabled = true;
        await showEquipList();
        addButton.disabled = false;
      })

      const removeButton = button.cloneNode();
      removeButton.textContent = '削除';
      removeButton.dataset.text = '削除';
      removeButton.dataset.mode = 'remove';
      /*
      const editButton = button.cloneNode();
      editButton.textContent = '編集';
      editButton.dataset.text = '編集';
      editButton.dataset.mode = 'edit';
      */
      const backupButton = button.cloneNode();
      backupButton.textContent = 'バックアップ';
      backupButton.addEventListener('click', ()=>{
        backupDialog.showModal();
      })

      const backupDialog = document.createElement('dialog');
      backupDialog.style.background = '#fff';
      backupDialog.style.color = '#000';
      backupDialog.style.left = 'auto';
      (()=>{
        const textarea = document.createElement('textarea');
        textarea.style.background = '#fff';
        textarea.style.color = '#000';
        textarea.style.whiteSpace = 'nowrap';
        textarea.style.width = '70vw';
        textarea.style.height = '50vh';
        textarea.style.overflowX = 'auto';
        const data = localStorage.getItem('equipPresets');
        if(data) {
          const json = JSON.parse(data);
          const formattedString = Object.entries(json)
            .map(([key, value]) => {return `  "${key}": ${JSON.stringify(value)}`;})
            .join(',\n');
          textarea.value = `{\n${formattedString}\n}`;
        }
        const div = document.createElement('div');
        const saveButton = button.cloneNode();
        saveButton.textContent = '保存';
        saveButton.addEventListener('click', ()=>{
          const isSuccess = importEquipPresets(textarea.value);
          if(isSuccess) backupDialog.close();
        });
        const copyButton = button.cloneNode();
        copyButton.textContent = 'コピー';
        copyButton.addEventListener('click', ()=>{navigator.clipboard.writeText(textarea.value).then(alert('copy'));})
        const closeButton = button.cloneNode();
        closeButton.textContent = '閉じる';
        closeButton.addEventListener('click', ()=>{backupDialog.close()})
        div.append(saveButton, copyButton, closeButton);
        backupDialog.append(textarea, div);
      })();

      [removeButton].forEach(button => {
        button.addEventListener('click', () => {
          const mode = button.dataset.mode;
          if (currentMode === mode) {
            resetMode(); 
            return;
          }
          setMode(mode, button);
        })        
      });

      function setMode(mode, button) {
        resetMode(); 
        currentMode = mode;
        button.textContent = '終了';
        button.classList.add('active');
        if(mode === 'remove') stat.textContent = '削除したいものを選択';
        else if (mode === 'edit') stat.textContent = 'クリックで編集';
      }

      function resetMode() {
        if (currentMode) {
          const activeButton = document.querySelector('.active');
          if (activeButton) {
            activeButton.textContent = activeButton.dataset.text;
            activeButton.classList.remove('active');
          }
        }
        currentMode = 'equip';
        stat.textContent = '';
      }

      const stat = document.createElement('p');
      stat.style.margin = '0';
      stat.style.height = '24px';
      stat.style.fontSize = '16px';
      stat.style.whiteSpace = 'nowrap';
      stat.style.overflowX = 'hidden';
      stat.classList.add('equip-preset-stat');
  
      div.append(closeButton, addButton, removeButton, backupButton, backupDialog, stat);
      panel.append(div);
    })();
  
    panel.append(presetList);
    document.body.append(panel);

    // equip item table dialog
    const equipField = document.createElement('dialog');
    equipField.style.background = '#fff';
    equipField.style.color = '#000';
    equipField.style.maxWidth = '90vw';
    equipField.style.height = '95vh';
    const closeButton = button.cloneNode();
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.height = '32px';
    closeButton.style.width = '32px';
    closeButton.style.top = '2px';
    closeButton.style.right = '2px';
    closeButton.style.lineHeight = '16px';
    closeButton.addEventListener('click', ()=>{equipField.close()});
    const tableContainer = document.createElement('div');
    tableContainer.style.height = '75vh';
    tableContainer.style.overflow = 'auto';
    const rankSelect = document.createElement('select');
    rankSelect.style.maxWidth = '64px';
    const ranks = ['N','R','SR','SSR','UR'];
    ranks.forEach(rank => {
      const option = document.createElement('option');
      option.textContent = rank;
      option.value = rank;
      rankSelect.append(option);
    })
    rankSelect.addEventListener('change', ()=>{filterItemsByRank(rankSelect.value)});
    const bar = document.createElement('div');
    const p = document.createElement('p');
    p.classList.add('equip-preset-selected');
    p.style.background = '#fff';
    p.style.color = '#000';
    p.style.margin = '2px';
    p.style.height = '28px';

    const equipSwitchButton = button.cloneNode();
    equipSwitchButton.textContent = '▶武器';
    equipSwitchButton.style.width = '4em';
    equipSwitchButton.style.whiteSpace = 'nowrap';
    equipSwitchButton.addEventListener('click', (event)=>{
      if(!weaponTable.style.display) {
        weaponTable.style.display = 'none';
        armorTable.style.display = '';
        necklaceTable.style.display = 'none';
        event.target.textContent = '▶防具';
      } else if (!armorTable.style.display) {
        weaponTable.style.display = 'none';
        armorTable.style.display = 'none';
        necklaceTable.style.display = '';
        event.target.textContent = '▶首';
      } else if (!necklaceTable.style.display) {
        weaponTable.style.display = '';
        armorTable.style.display = 'none';
        necklaceTable.style.display = 'none';
        event.target.textContent = '▶武器';
      }
    });

    // register
    const registerButton = button.cloneNode();
    registerButton.textContent = '登録';
    (()=>{
      const dialog = document.createElement('dialog');
      dialog.style.background = '#fff';
      dialog.style.border = 'solid 1px #000';
      dialog.style.color = '#000';
      const presetNameInput = document.createElement('input');
      presetNameInput.placeholder = 'プリセット名';
      presetNameInput.style.background = '#fff';
      presetNameInput.style.color = '#000';
      const p = document.createElement('p');
      p.textContent = '同名のプリセットが存在する場合は上書きされます。';
      p.style.margin = '0';
      const confirmButton = button.cloneNode();
      confirmButton.textContent = '保存';
      confirmButton.addEventListener('click', ()=>{
        saveEquipPreset(presetNameInput.value.substring(0,32), selectedEquips);
        dialog.close();
        presetNameInput.value = '';
      })
      const cancelButton = button.cloneNode();
      cancelButton.textContent = 'キャンセル';
      cancelButton.addEventListener('click', ()=>{dialog.close()});
      dialog.append(presetNameInput, confirmButton, cancelButton, p);
      equipField.append(dialog);
      registerButton.addEventListener('click', ()=>{
        if(!selectedEquips.id[0] || !selectedEquips.id[1]) {
          alert('装備が未選択です');
          return;
        }
        dialog.showModal();
      });
    })();

    bar.append(rankSelect, equipSwitchButton, registerButton, p);
    equipField.append(bar, tableContainer, closeButton);
    document.body.append(equipField);

    let weaponTable, armorTable, necklaceTable;
    let selectedEquips = {id:[], rank:[]};

    function sortTable(table){
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.rows);
      rows.sort((a,b) => {
        const nameA = a.cells[0].textContent;
        const nameB = b.cells[0].textContent;
        return nameA.localeCompare(nameB);
      })
      rows.forEach(row => tbody.appendChild(row));
    }

    async function showEquipList(){
      if(!weaponTable || !armorTable || !necklaceTable) {
        try {
          const res = await fetch('https://donguri.5ch.net/bag');
          if(!res.ok) throw new Error('bag response error');
          const text = await res.text();
          const doc = new DOMParser().parseFromString(text, 'text/html');
          const h1 = doc.querySelector('h1');
          if(h1?.textContent !== 'アイテムバッグ') throw new Error(text);
          weaponTable = doc.querySelector('#weaponTable');
          armorTable = doc.querySelector('#armorTable');
          necklaceTable = doc.querySelector('#necklaceTable');
          if(!weaponTable || !armorTable || !necklaceTable) throw new Error('failed to find weapon/armor table');

          [weaponTable,armorTable,necklaceTable].forEach((table,index) => {
            sortTable(table);
            table.style.color = '#000';
            table.style.margin = '0';
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
              const id = row.cells[1].querySelector('a')?.href.replace('https://donguri.5ch.net/equip/','');
              row.cells[0].style.textDecorationLine = 'underline';
              row.cells[0].style.cursor = 'pointer';
              row.cells[0].dataset.id = id;
              row.cells[1].style.display = 'none';
              row.cells[2].style.display = 'none';
              if(index !== 2) {
                const modLink = row.cells[7].querySelector('a');
                if(modLink) modLink.target = '_blank';
                row.cells[9].style.display = 'none';
              } else if (index === 2) {
                row.cells[3].style.whiteSpace = 'nowrap';
                const ul = row.cells[3].querySelector('ul');
                if(ul) ul.style.padding = '0';
                row.cells[5].style.display = 'none';
              }
              row.cells[0].addEventListener('click', (event)=>{
                if(!event.target.closest('td')) return;
                const target = event.target.closest('td');
                const itemName = target.textContent;
                //const rank = ranks.find(val => itemName.includes(`[${val}]`) || '');
                const rank = itemName.match(/\[(.+?)\]/)[1];
                const id = target.dataset.id;
                selectedEquips.id[index] = id;
                selectedEquips.rank[index] = rank;
                document.querySelector('.equip-preset-selected').textContent = selectedEquips.id;
              })
            })
          })
          tableContainer.append(weaponTable, armorTable, necklaceTable);
        } catch(e) {
          console.error(e);
          return;
        }
      }

      equipSwitchButton.textContent = '▶武器';
      weaponTable.style.display = '';
      armorTable.style.display = 'none';
      necklaceTable.style.display = 'none';
      filterItemsByRank(rankSelect.value);
      document.querySelector('.equip-preset-selected').textContent = '';
      equipField.showModal();
    }
    function filterItemsByRank (rank){
      [weaponTable, armorTable].forEach(table => {
        table.querySelectorAll('tbody > tr').forEach(row => {
          const itemName = row.cells[0].textContent;
          row.style.display = itemName.includes(`[${rank}]`) ? null : 'none';
        })
      })
    }
    function saveEquipPreset(name, obj){
      let equipPresets = {};
      if(localStorage.hasOwnProperty('equipPresets')){
        equipPresets = JSON.parse(localStorage.getItem('equipPresets'));
      }
      equipPresets[name] = obj;
      localStorage.setItem('equipPresets', JSON.stringify(equipPresets));
      showEquipPreset();
    }
    function showEquipPreset(){
      let equipPresets = {};
      if(localStorage.getItem('equipPresets')){
        equipPresets = JSON.parse(localStorage.getItem('equipPresets'));
      }
      const liTemplate = document.createElement('li');
      liTemplate.style.display = 'flex';
      liTemplate.style.justifyContent = 'space-between';
      liTemplate.style.borderBottom = 'solid 1px #000';
      liTemplate.style.color = '#428bca';
      liTemplate.style.cursor = 'pointer';
      const span1 = document.createElement('span');
      span1.style.flexGrow = '1';
      span1.style.whiteSpace = 'nowrap';
      span1.style.overflowX = 'hidden';
      const span2 = document.createElement('span');
      span2.style.whiteSpace = 'nowrap';
      span2.style.textAlign = 'right';
      span2.style.fontSize = '90%';
      liTemplate.append(span1,span2);
      const fragment = document.createDocumentFragment();
      Object.entries(equipPresets).forEach(([key, value])=>{
        const li = liTemplate.cloneNode(true);
        const span = li.querySelectorAll('span');
        span[0].textContent = key;
        span[1].textContent = value.rank.join(',');
        fragment.append(li);
      })
      presetList.replaceChildren(fragment);
    }
    function importEquipPresets(text){
      try{
        if(text.trim() === ''){
          localStorage.removeItem('equipPresets');
          showEquipPreset();
          return true;
        }
        const json = JSON.parse(text);
        localStorage.setItem('equipPresets', JSON.stringify(json));
        showEquipPreset();
        return true;
      } catch (e) {
        if (e instanceof SyntaxError) {
          alert('書式エラー');
        }
        return false;
      }

    }
    async function setPresetItems (presetName) {
      const stat = document.querySelector('.equip-preset-stat');
      stat.textContent = '装備中...';
      const equipPresets = JSON.parse(localStorage.getItem('equipPresets'));
      const fetchPromises = equipPresets[presetName].id
        .filter(id => id !== undefined && id !== null && !currentEquip.includes(id)) //未登録or既に装備中の部位は除外
        .map(id => fetch('https://donguri.5ch.net/equip/' + id));

      try {
        const responses = await Promise.all(fetchPromises);
        const texts = await Promise.all(
          responses.map(async response => {
            if (!response.ok) {
              throw new Error('読み込み失敗');
            }
            return response.text();
          })
        );
        
        if(texts.includes('どんぐりが見つかりませんでした。')) {
          throw new Error('再ログインしてください');
        } else if(texts.includes('アイテムが見つかりませんでした。')) {
          throw new Error('アイテムが見つかりませんでした');
        }

        const docs = texts.map(text => new DOMParser().parseFromString(text,'text/html'));
        const titles = docs.map(doc => doc.querySelector('h1')?.textContent);
        if(titles.includes('どんぐり基地')) {
          throw new Error('再ログインしてください');
        } else if (!titles.every(title => title === 'アイテムバッグ')) {
          throw new Error('装備エラー');
        }
        stat.textContent = '完了';
        currentEquip = equipPresets[presetName].id;
      } catch (e) {
        stat.textContent = e;
        currentEquip = [];
      }
    }
    function removePresetItems(presetName) {
      const userConfirmed = confirm(presetName + ' を削除しますか？');
      if(!userConfirmed) return;
      const stat = document.querySelector('.equip-preset-stat');
      const equipPresets = JSON.parse(localStorage.getItem('equipPresets'));
      if(!equipPresets || !equipPresets[presetName]) {
        stat.textContent = '';
        return;
      }
      delete equipPresets[presetName];
      localStorage.setItem('equipPresets', JSON.stringify(equipPresets));
      showEquipPreset();
    }  
  })();
  //-- ここまで --//

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
    refreshAreaInfo();
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
      const text = await response.text();
      arenaResult.style.display = 'block';
      arenaResult.innerText = text;
      arenaResult.scrollTop = arenaResult.scrollHeight;
      arenaResult.style.display = '';
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

  function drawProgressBar(){
    fetch('https://donguri.5ch.net/')
    .then(res => res.ok ? res.text() : Promise.reject('res.ng'))
    .then(text => {
      const doc = new DOMParser().parseFromString(text,  'text/html'),
      //headerDiv = document.body.querySelector('header > div'),
      container = doc.querySelector('div.stat-block:nth-child(2)>div:nth-child(5)').cloneNode(true);
      progressBar = container.lastElementChild,
      barBody = progressBar.lastElementChild,
      percentage = parseInt(barBody.textContent);
      let str,min,totalSec,sec,margin;
      if (percentage === 0 || percentage === 50) {
        str = '（マップ更新時）';
      } else {
        if (percentage === 100) {
          min = 0;
          sec = 20;
          margin = 10;
        } else {
          totalSec = (percentage < 50) ? (50 - percentage) * 36 : (100 - percentage) * 36 + 10;
          min = Math.trunc(totalSec / 60);
          sec = totalSec % 60;
          margin = 20;
        }
        str = '（マップ更新まで' + min + '分' + sec + '秒 \xb1' + margin + '秒）';
      }
      progressBar.before(str, document.createElement('br'));
      progressBar.style.display = 'inline-block';
      progressBar.style.width = '400px';
      progressBar.style.maxWidth = '100vw';
      progressBar.style.height = '20px';
      progressBar.style.background = '#ccc';
      progressBar.style.borderRadius = '8px';
      progressBar.style.fontSize = '16px';
      progressBar.style.overflow = 'hidden';
      progressBar.style.marginTop = '5px';
      barBody.style.height = '100%';
      barBody.style.lineHeight = 'normal';
      barBody.style.background = '#428bca';
      barBody.style.textAlign = 'right';
      barBody.style.paddingRight = '5px';
      barBody.style.boxSizing = 'border-box';
      barBody.style.color = 'white';
      barBody.style.width = barBody.style.width;
      progressBarContainer.replaceChildren(container)
    })
    .catch(e => console.error(e))
  }

  drawProgressBar();
  setInterval(() => {
    drawProgressBar();
  }, 18000);
})();
