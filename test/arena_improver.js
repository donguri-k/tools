// ==UserScript==
// @name         donguri arena assist tool
// @version      1.1a
// @description  fix arena ui and add functions
// @author       7234e634
// @match        https://donguri.5ch.net/teambattle
// ==/UserScript==


(()=>{
  const vw = Math.min(document.documentElement.clientWidth, window.innerWidth || 0);

  const header = document.querySelector('header');
  const toolbar = document.createElement('div');
  toolbar.style.position = 'fixed';
  toolbar.style.top = '0';
  toolbar.style.zIndex = '1';
  toolbar.style.background = '#fff';
  toolbar.style.border = 'solid 1px #000';
  toolbar.style.marginLeft = '-8px';
  header.querySelector('h4').style.display = 'none';
  header.append(toolbar);
  const progressBarContainer = document.createElement('div');
  toolbar.append(progressBarContainer);

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
      button.style.fontSize = '60%';
      progressBarContainer.style.fontSize = '60%';
    }

    const menuButton = button.cloneNode();
    menuButton.textContent = '■メニュー';
    menuButton.addEventListener('click', ()=>{
      menuDialog.show();
    })
  
    const equipButton = button.cloneNode();
    equipButton.textContent = '■装備';
    equipButton.addEventListener('click', ()=>{
      panel.style.display = 'flex';
    });
  
    const sortButton = button.cloneNode();
    sortButton.textContent = '▼ソート';
    sortButton.addEventListener('click', ()=>{
      sortMenu.style.display = 'flex';
    });

    const cellButton = button.cloneNode();
    cellButton.textContent = '詳細取得/更新';
    cellButton.addEventListener('click',getArenaInfo);
  
    const refreshButton = button.cloneNode();
    refreshButton.textContent = '陣地更新';
    refreshButton.addEventListener('click',refreshAreaInfo);

    const main = document.createElement('div');
    main.style.display = 'flex';
    main.style.flexWrap = 'nowrap';
    main.style.gap = '2px';
    main.style.justifyContent = 'center';
    main.append(menuButton, equipButton, sortButton, refreshButton, cellButton);

    
    const defaultSort = button.cloneNode();
    const condSort = button.cloneNode();
    defaultSort.textContent = 'デフォルト順';
    condSort.textContent = '装備制限順';
    defaultSort.addEventListener('click', ()=>{
      sortCells('default');
      sortMenu.style.display = 'none';
    })
    condSort.addEventListener('click', ()=>{
      sortCells('cond');
      sortMenu.style.display = 'none';
    })

    const sortMenu = document.createElement('div');
    sortMenu.style.display = 'none';
    sortMenu.style.flexWrap = 'nowrap';
    sortMenu.style.gap = '2px';
    sortMenu.style.justifyContent = 'center';
    sortMenu.append(defaultSort, condSort);

    toolbar.append(main, sortMenu);
    toolbar.addEventListener('mousedown', (event)=>{
      if (!sortMenu.contains(event.target)) {
        sortMenu.style.display = 'none';
      }
    })
  })();

  const arenaField = document.createElement('dialog');
  arenaField.style.position = 'fixed';
  arenaField.style.width = '100%';
  arenaField.style.bottom = '20px';
  arenaField.style.background = 'none';
  arenaField.style.background = '#fff';
  arenaField.style.color = '#000';
  arenaField.style.border = 'solid 1px #000';
  arenaField.style.marginLeft = '1px';
  arenaField.style.maxWidth = '480px';
  const arenaModDialog = document.createElement('dialog');
  let wood, steel

  (()=>{
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '2px';

    const button = document.createElement('button');
    button.type = 'button';
    button.style.whiteSpace = 'nowrap';

    if (vw < 768) {
      button.style.fontSize = '80%';
    }

    const challengeButton = button.cloneNode();
    challengeButton.textContent = 'エリアに挑む';
    challengeButton.style.flexGrow = '2';
    challengeButton.addEventListener('click', ()=>{
      const table = arenaField.querySelector('table');
      const row = table.dataset.row;
      const col = table.dataset.col;
      arenaChallenge(row, col);
    })

    const reinforceButton = button.cloneNode();
    reinforceButton.textContent = '強化する';
    reinforceButton.style.flexGrow = '1';
    reinforceButton.addEventListener('click', ()=>{
      arenaModDialog.dataset.action = 'ReinforceArena';
      modButton.textContent = '強化する';
      p.textContent = `木材: ${wood}, 鉄: ${steel}; 1ptにつき各25個`;
      arenaModDialog.show();
    })

    const siegeButton = button.cloneNode();
    siegeButton.textContent = '弱体化する';
    siegeButton.style.flexGrow = '1';
    siegeButton.addEventListener('click', ()=>{
      arenaModDialog.dataset.action = 'SiegeArena';
      modButton.textContent = '弱体化する';
      p.textContent = `木材: ${wood}, 鉄: ${steel}; 1ptにつき各25個`;
      arenaModDialog.show();
    })

    const closeButton = button.cloneNode();
    closeButton.textContent = '×';
    closeButton.marginLeft = 'auto';
    closeButton.style.fontSize = '24px';
    closeButton.style.width = '48px';
    closeButton.style.height = '48px';
    closeButton.style.lineHeight = '1';

    const p = document.createElement('p');
    const modButton = button.cloneNode();

    closeButton.addEventListener('click', ()=>{arenaField.close()});
    const table = document.createElement('table');
    div.append(challengeButton, reinforceButton, siegeButton, closeButton);
    arenaField.append(div, table, arenaModDialog);
    (()=>{
      arenaModDialog.style.background = '#fff';
      arenaModDialog.style.border = 'solid 1px #000';
      arenaModDialog.style.color = '#000';
      arenaModDialog.style.position = 'fixed';
      arenaModDialog.style.bottom = '20px';

      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.gap = '2px';

      const input = document.createElement('input');
      input.type = 'number';
      input.placeholder = '改造の量';

      modButton.addEventListener('click', ()=>{
        const amt = Number(input.value);
        const table = arenaField.querySelector('table');
        const row = table.dataset.row;
        const col = table.dataset.col;
        const action = arenaModDialog.dataset.action;
        arenaMod(row, col, action, amt);
        arenaModDialog.close();
      })

      input.addEventListener('keydown', (e)=>{
        if (e.key === "Enter") {
          e.preventDefault(); // これが無いとdialogが閉じない
          const amt = Number(input.value);
          const table = arenaField.querySelector('table');
          const row = table.dataset.row;
          const col = table.dataset.col;
          const action = arenaModDialog.dataset.action;
          arenaMod(row, col, action, amt);
          arenaModDialog.close();
        }
      })

      div.append(input, modButton);
      arenaModDialog.append(div, p);
    })();

    async function arenaMod(row, col, action, amt){
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `row=${row}&col=${col}&action=${action}&amt=${amt}`
      };
      try{
        const res = await fetch('/teamvol/', options);
        if(!res.ok) throw new Error('/teamvol/ failed to load');
        const text = await res.text();
        if(text.includes('資源パックを開ける')) {
          open('/craft', '_blank');
          return;
        }
        if(text !== '改造成功') throw new Error(text);
        wood = wood - 25 * Math.trunc(amt);
        steel = steel - 25 * Math.trunc(amt);
        arenaResult.textContent = text;
        arenaResult.show();
      } catch (e) {
        arenaResult.textContent = e;
        arenaResult.show();
      }
    }
  })();

  const arenaResult = document.createElement('dialog');
  arenaResult.style.position = 'fixed';
  arenaResult.style.width = '60%';
  arenaResult.style.bottom = '20px';
  arenaResult.style.left = 'auto';
  arenaResult.style.height = '70vh';
  arenaResult.style.maxHeight = '640px';
  arenaResult.style.background = '#fff';
  arenaResult.style.color = '#000';
  arenaResult.style.fontSize = '70%';
  arenaResult.style.border = 'solid 1px #000';
  arenaResult.style.margin = '0';
  arenaResult.style.textAlign = 'left';
  arenaResult.style.overflowY = 'auto';
  window.addEventListener('mousedown', (event) => {
    if (!arenaResult.contains(event.target)) {
      arenaResult.close();
    }
    if (!arenaModDialog.contains(event.target)) {
      arenaModDialog.close();
    }
    if (!menuDialog.contains(event.target)) {
      menuDialog.close();
    }
    if (!panel.contains(event.target)) {
      panel.style.display = 'none';
    }
  });
  arenaField.append(arenaResult);
  document.body.append(arenaField);
  
  const grid = document.querySelector('.grid');
  grid.parentNode.style.height = null;
  grid.style.maxWidth = '100%';

  const table = document.querySelector('table');
  table.parentNode.style.maxWidth = '100%';
  table.parentNode.style.overflow = 'auto';
  table.parentNode.style.height = '60vh';

  //-- メニュー --//
  const menuDialog = document.createElement('dialog');
  menuDialog.style.position = 'fixed';
  menuDialog.style.top = '0';
  menuDialog.style.left = 'auto';
  menuDialog.style.background = '#f0f0f0';
  menuDialog.style.border = 'solid 1px #000';
  menuDialog.style.height = '100vh';
  menuDialog.style.width = '400px';
  menuDialog.style.maxWidth = '75vw';
  menuDialog.style.padding = '2px';
  menuDialog.style.margin = '0';
  menuDialog.style.zIndex = '2';
  menuDialog.style.textAlign = 'left';
  (()=>{
    const button = document.createElement('button');
    button.type = 'button';
    button.style.borderRadius = 'unset';
    button.style.border = 'solid 1px #000';
    button.style.background = '#ccc';
    button.style.color = '#000';
    button.style.margin = '2px';
    button.style.height = '42px';
    button.style.lineHeight = '1';

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.height = '100%';
    container.style.color = '#000';

    const h2 = document.createElement('h2');
    h2.textContent = 'メニュー・設定'
    h2.style.fontSize = '1rem';
    h2.style.margin = '2px';

    const settingsMenu = document.createElement('div');
    settingsMenu.style.flexGrow = '1';
    settingsMenu.style.overflowY = 'auto';
    settingsMenu.textContent = '(ここに設定項目を追加予定)';
    
    const footer = document.createElement('div');
    footer.style.fontSize = '80%';
    footer.style.textAlign = 'right';

    (()=>{
      const link = document.createElement('a');
      link.style.color = '#666';
      link.style.textDecoration = 'underline';
      link.textContent = 'arena assist tool - v1.1a';
      link.href = 'https://donguri-k.github.io/tools/arena-assist-tool';
      link.target = '_blank';
      const author = document.createElement('input');
      author.value = '作者 [ID: 7234e634]';
      author.style.color = '#666';
      author.style.background = 'none';
      author.style.margin = '2px';
      author.style.padding = '2px';
      author.style.width = 'fit-content';
      author.readOnly = 'true';
      author.addEventListener('click',()=>{
        author.select();
        navigator.clipboard.writeText('7234e634');
      })
      footer.append(link, author);
    })();
    
    const autoJoinButton = button.cloneNode();
    autoJoinButton.textContent = '自動参加モード';
    autoJoinButton.style.width = '100%';
    autoJoinButton.addEventListener('click',()=>{
      autoJoinDialog.showModal();
      autoJoin();
    })

    const autoJoinDialog = document.createElement('dialog');
    autoJoinDialog.style.background = '#fff';
    autoJoinDialog.style.color = '#000';
    autoJoinDialog.style.width = '90vw';
    autoJoinDialog.style.height = '95vh';
    autoJoinDialog.style.fontSize = '80%';
    autoJoinDialog.style.textAlign = 'center';
    autoJoinDialog.classList.add('auto-join');
    autoJoinDialog.addEventListener('show', (event) => {
      event.preventDefault(); // 自動フォーカスを防ぐ?
    });

    (()=>{
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.height = '100%';
      container.style.color = '#000';

      const log = document.createElement('div');
      log.style.margin = '2px';
      log.style.border = 'solid 1px #000';
      log.style.overflow = 'auto';
      log.style.flexGrow = '1';
      log.style.textAlign = 'left';
      log.classList.add('auto-join-log');

      const label = document.createElement('label');
      const autoJoinInterval = document.createElement('input');
      autoJoinInterval.type = 'number';
      autoJoinInterval.placeholder = '600';
      autoJoinInterval.style.width = '64px';
      autoJoinInterval.style.background = '#fff';
      autoJoinInterval.style.color = '#000';
      label.append(autoJoinInterval, '秒');
  
      const closeButton = button.cloneNode();
      closeButton.textContent = '自動参加モードを終了';
      closeButton.addEventListener('click', ()=>{
        autoJoinDialog.close();
      })
      const p = document.createElement('p');
      p.textContent = 'この画面を開いたままにしておくこと。最短600秒';
      p.style.margin = '0';

      container.append(log, label, p, closeButton);
      autoJoinDialog.append(container);
    })();
    container.append(h2, autoJoinButton, settingsMenu, footer)
    menuDialog.append(container, autoJoinDialog);
  })();
  
  document.body.append(menuDialog);

  //-- 装備 --//
  const panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.top = '0';
  panel.style.right = '0';
  panel.style.background = '#f0f0f0';
  panel.style.border = 'solid 1px #000';
  panel.style.height = '100vh';
  panel.style.width = '400px';
  panel.style.maxWidth = '75vw';
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
    button.style.height = '42px';
    button.style.lineHeight = '1';

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
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.display = 'flex';
  
      const closeButton = button.cloneNode();
      closeButton.textContent = '×';
      closeButton.style.marginLeft = 'auto';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.height = '40px';
      closeButton.style.width = '40px';
      closeButton.style.fontSize = '32px';
      closeButton.style.lineHeight = '1';
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
      backupButton.style.height = '42px';
      backupButton.style.lineHeight = '1';
      backupButton.style.fontSize = '80%';

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
        backupButton.addEventListener('click', ()=>{
          const data = localStorage.getItem('equipPresets');
          if(data) {
            const json = JSON.parse(data);
            const formattedString = Object.entries(json)
              .map(([key, value]) => {return `  "${key}": ${JSON.stringify(value)}`;})
              .join(',\n');
            textarea.value = `{\n${formattedString}\n}`;
          }
          backupDialog.showModal();
        })
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
      stat.style.overflow = 'hidden';
      stat.classList.add('equip-preset-stat');
  
      buttonsContainer.append(addButton, removeButton, backupButton, closeButton);
      div.append(buttonsContainer, backupDialog, stat);
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
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.height = '40px';
    closeButton.style.width = '40px';
    closeButton.style.fontSize = '32px';
    closeButton.style.top = '2px';
    closeButton.style.right = '2px';
    closeButton.style.lineHeight = '1';
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
    bar.style.textAlign = 'center';
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
      dialog.style.textAlign = 'center';
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
        if(presetNameInput.value.trim() === '') return;
        saveEquipPreset(presetNameInput.value.substring(0,32), selectedEquips);
        dialog.close();
        presetNameInput.value = '';
      })
      presetNameInput.addEventListener('keydown', (e)=>{
        if (e.key === "Enter") {
          e.preventDefault(); // これが無いとdialogが閉じない
          if(presetNameInput.value.trim() === '') return;
          saveEquipPreset(presetNameInput.value.substring(0,32), selectedEquips);
          dialog.close();
          presetNameInput.value = '';  
        }
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
    panel.append(equipField);

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
      if (stat.textContent === '装備中...') return;
      const equipPresets = JSON.parse(localStorage.getItem('equipPresets'));
      const fetchPromises = equipPresets[presetName].id
        .filter(id => id !== undefined && id !== null && !currentEquip.includes(id)) // 未登録or既に装備中の部位は除外
        .map(id => fetch('https://donguri.5ch.net/equip/' + id));

      stat.textContent = '装備中...';

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
      } catch (e) {
        stat.textContent = e;
        currentEquip = [];
      } finally {
        stat.textContent = '完了: ' + presetName;
        currentEquip = equipPresets[presetName].id;
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
    grid.style.gridTemplateRows = grid.style.gridTemplateRows.replace('35px','65px');
    grid.style.gridTemplateColumns = grid.style.gridTemplateColumns.replace('35px','105px');
    grid.parentNode.style.height = null;
    grid.parentNode.style.padding = '20px 0';
    const cols = Number(grid.style.gridTemplateColumns.match(/repeat\((\d+),/)[1]);
    if (vw < 768 && cols > 8) {
      grid.style.gridTemplateColumns = 'repeat(8, 105px)';
    }

    [...document.querySelectorAll('.cell')].forEach(elm => {
      let row = elm.dataset.row,
      col = elm.dataset.col,
      url = `https://donguri.5ch.net/teambattle?r=${row}&c=${col}`;
      fetch(url)
      .then(res=>
        res.ok?res.text():Promise.reject('res.ng')
      )
      .then(text => {
        let doc = new DOMParser().parseFromString(text, 'text/html'),
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
        const cell = elm.cloneNode();
        cell.append(p[0],p[1]);
        cell.style.overflow = 'hidden';
        cell.style.width = '100px';
        cell.style.height = '60px';
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
            showArenaTable(table);
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

  (()=>{
    [...document.querySelectorAll('.cell')].forEach(elm => {
      const cell = elm.cloneNode();
      elm.replaceWith(cell);
      cell.addEventListener('click', ()=>{
        let row = elm.dataset.row,
        col = elm.dataset.col,
        url = `https://donguri.5ch.net/teambattle?r=${row}&c=${col}`;  
        fetch(url)
        .then(res => res.ok?res.text():Promise.reject('res.ng'))
        .then(text => {
          const doc = new DOMParser().parseFromString(text,'text/html');
          const h1 = doc?.querySelector('h1')?.textContent;
          if(h1 !== 'どんぐりチーム戦い') return Promise.reject(`title.ng`);
          const table = doc.querySelector('table');
          if(!table) return Promise.reject(`table.ng`);
          showArenaTable(table);
        })
        arenaField.show();
      });
    })
  })();

  function showArenaTable(table){
    const row = table.querySelector('tbody > tr');
    if(!row) return;
    const coordinate = row.cells[0].textContent.replace('アリーナ','').trim();
    const holderName = row.cells[1].querySelector('strong');
    const equipCond = row.cells[1].querySelector('small');
    const teamName = row.cells[2].textContent;
    const statistics = row.cells[3].textContent.match(/\d+/g);
    const modCounts = row.cells[4].textContent.match(/\d+/g);
    const modders = row.cells[5].textContent;

    const newTable = document.createElement('table');
    const tbody = document.createElement('tbody');
    const tr = tbody.insertRow(0);

    const cell = document.createElement('td');
    cell.style.textAlign = 'center';
    const cells = [];
    for(let i=0; i<4; i++){
      cells.push(cell.cloneNode());
      tr.append(cells[i]);
    }
    cells[0].append(coordinate, document.createElement('hr'), equipCond);
    cells[1].append(holderName, document.createElement('br'), `${teamName}`);
    cells[2].innerText = `勝:${statistics[0]}\n負:${statistics[1]}\n引:${statistics[2]}`;
    cells[3].innerText = `強化:${modCounts[0]}\n弱体:${modCounts[1]}\n${modders}人`;
    cells[3].style.whiteSpace = 'nowrap';

    const [dataRow, dataCol] = coordinate.match(/\d+/g);
    newTable.dataset.row = dataRow;
    newTable.dataset.col = dataCol;
    newTable.style.background = '#fff';
    newTable.style.color = '#000';
    newTable.style.margin = '0';
    newTable.append(tbody);
    arenaField.querySelector('table').replaceWith(newTable);
  }

  async function arenaChallenge (row, col){
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `row=${row}&col=${col}`
    };
    try {
      const response = await fetch('/teamchallenge', options);
      if(!response.ok){
        throw new Error('/teamchallenge res.ng');
      }
      const text = await response.text();
      arenaResult.innerText = text;
      /*
      arenaResult.style.display = 'block';
      arenaResult.innerText = text;
      arenaResult.scrollTop = arenaResult.scrollHeight;
      arenaResult.style.display = '';
      */
      if(text.includes('\n')) {
        const lastLine = text.trim().split('\n').pop();
        lastLine + '\n' + text;
        const p = document.createElement('p');
        p.textContent = lastLine;
        p.style.fontWeight = 'bold';
        p.style.padding = '0';
        p.style.margin = '0';
        arenaResult.prepend(p);
      }
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

  function autoJoin() {
    const dialog = document.querySelector('.auto-join');
    const interval = () => {
      const input = dialog.querySelector('input');
      let value = Number(input.value);
      if (!value || value < 600) {
        input.value = 600;
        value = 600;
      }
      return value;
    }
  
    const logArea = dialog.querySelector('.auto-join-log');
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const regions = [];
    for (let i = 0; i < 20; i++) {
      for (let j = i - 1; j >= 0; j--) {
        regions.push([i, j], [j, i]);
      }
      regions.push([i, i]);
    }
  
    function logMessage(message) {
      const timestamp = new Date().toLocaleString('sv-SE');
      logArea.prepend(`[${timestamp}] `, message, document.createElement('br'));
    }
  
    const errorMesssages = {
      retry: [
        'あなたのチームは動きを使い果たしました。しばらくお待ちください。',
        'ng<>too fast'
      ],
      reset: [
        'No region',
      ],
      quit: [
        '武器と防具を装備しなければなりません。',
        'どんぐりが見つかりませんでした。'
      ]
    }
    function challenge(index = 0) {
      if(!dialog.open) return;
      logMessage('challenge: ' + regions[index]);
      const body = `row=${regions[index][0]}&col=${regions[index][1]}`;
      
      fetch('/teamchallenge', {
        method: 'POST',
        body: body,
        headers: headers
      })
        .then(response => response.ok ? response.text() : Promise.reject(`res.ng[${response.status}]`))
        .catch(error => logMessage(error))
        .then(text => {
          let nextStep = [0, interval()];
          if (text.startsWith('装備している')) {
            // 装備している防具と武器が力不足です。
            // 装備している防具と武器が強すぎます
            // 装備しているものは改造が多すぎます。改造の少ない他のものをお試しください
            nextStep = [index + 1, 2];
          } else if (errorMesssages.retry.some(v => text.includes(v))) {
            nextStep = [index, 8];
          } else if (errorMesssages.reset.some(v => text.includes(v))) { // 発生しない?
            nextStep = [0, 2];
          } else if (errorMesssages.quit.some(v => text.includes(v))) {
            logMessage(text + '[停止]');
            return;
          }
          logMessage(text.slice(0, 80));
          logMessage(`next(${nextStep[1]}sec): ${regions[nextStep[0]]}`);
          setTimeout(() => challenge(nextStep[0]), 1000 * nextStep[1]);
        });
    }
    challenge();
  };
  
  function drawProgressBar(){
    fetch('https://donguri.5ch.net/')
    .then(res => res.ok ? res.text() : Promise.reject('res.ng'))
    .then(text => {
      const doc = new DOMParser().parseFromString(text, 'text/html'),
      container = doc.querySelector('div.stat-block:nth-child(2)>div:nth-child(5)').cloneNode(true),
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
      progressBarContainer.replaceChildren(container);

      const statBlock = doc.querySelector('.stat-block');
      wood = statBlock.textContent.match(/木材の数: (\d+)/)[1];
      steel = statBlock.textContent.match(/鉄の数: (\d+)/)[1];
    })
    .catch(e => console.error(e))
  }

  drawProgressBar();
  (()=>{
    let intervalId;
    function startInterval() {
      if (!intervalId) {
        intervalId = setInterval(() => {
          drawProgressBar();
        }, 18000);
      }
    }
    function stopInterval() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
    const dialog = document.querySelector('.auto-join');
    const observer = new MutationObserver(() => {
      dialog.open ? stopInterval() : startInterval();
    });
    
    observer.observe(dialog, {
      attributes: true, 
      attributeFilter: ['open']
    });
    startInterval();
  })();
})();
