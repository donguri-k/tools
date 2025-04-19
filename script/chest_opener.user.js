// ==UserScript==
// @name         donguri Chest Opener
// @version      1.2a
// @description  Automated box opening and recycling
// @author       7234e634
// @match        https://donguri.5ch.net/bag
// @match        https://donguri.5ch.net/chest
// @match        https://donguri.5ch.net/battlechest
// ==/UserScript==

(()=>{
  const container = document.createElement('div');
  const details = document.createElement('details');
  //details.open = true; /* bookmarklet用 true */
  details.classList.add('chest-opener');
  details.style.background = '#ddd';
  const summary = document.createElement('summary');
  summary.textContent = 'Chest Opener v1.2a';

  const fieldset = document.createElement('fieldset');
  fieldset.style.border = 'none';
  fieldset.style.padding = '0';

  // switch chest
  const switchChestField = fieldset.cloneNode();
  (()=>{
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'chestType';
    const equipChest = radio.cloneNode();
    const battleChest = radio.cloneNode();
    equipChest.checked = true;
    equipChest.addEventListener('click',()=>{
      equipChestField.style.display = '';
      equipChestButton.style.display = '';
      battleChestField.style.display = 'none';
      battleChestButton.style.display = 'none';
    })
    battleChest.addEventListener('click',()=>{
      equipChestField.style.display = 'none';
      equipChestButton.style.display = 'none';
      battleChestField.style.display = '';
      battleChestButton.style.display = '';
    })

    const equipLabel = document.createElement('label');
    equipLabel.style.display = 'inline-flex';
    equipLabel.append(equipChest, '宝箱');
    const battleLabel = document.createElement('label');
    battleLabel.style.display = 'inline-flex';
    battleLabel.append(battleChest, 'バトル宝箱');
    switchChestField.append(equipLabel, battleLabel);
    details.append(switchChestField);
  })();

  const shouldNotRecycle = document.createElement('input');
  shouldNotRecycle.type = 'checkbox';
  (()=>{
    const div = document.createElement('div');
    const label = document.createElement('label');
    label.style.fontSize = '16px';
  
    label.append(shouldNotRecycle, 'ロック・分解しないモード');
    div.append(label);
    details.append(div);
  })();
  
  const form = document.createElement('form');
  const equipChestField = fieldset.cloneNode();
  //equipChestField.style.display = 'none';
  form.append(equipChestField);
  equipChestField.addEventListener('change', saveInputData);

  const battleChestField = fieldset.cloneNode();
  battleChestField.style.display = 'none';
  form.append(battleChestField);
  battleChestField.addEventListener('change', saveInputData);

  details.append(summary,equipChestField,battleChestField);

  // item settings
  (()=>{
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = '== 残すアイテム([錠]) ==';
    div.append(p);
  
    const ranks = ['[UR]','[SSR]','[SR]','[R]','[N]'];
    const span = document.createElement('span');
    span.style.width = '64px';
    span.style.fontSize = '18px';
    span.style.whiteSpace = 'nowrap';

    const chkbox = document.createElement('input');
    chkbox.type = 'checkbox';
    chkbox.style.height = '18px';
    chkbox.style.width = '18px';
    chkbox.classList.add('keep-item');

    const input = document.createElement('input');
    input.style.flex = '1';
    input.style.marginRight = '0';
    input.style.fontSize = '80%';
    input.classList.add('wishlist');

    for(const v of ranks){
      const label = document.createElement('label');
      label.style.display = 'flex';
      const span_ = span.cloneNode();
      const chkbox_ = chkbox.cloneNode();
      chkbox_.value = v;
      span_.append(chkbox_,v);

      const input_ = input.cloneNode();
      input_.dataset.rank = v;

      label.append(span_,input_);
      div.append(label);

      input_.addEventListener('input',()=>{
        if(input_.value !== ''){
          chkbox_.checked = true;
        }
      })
    };

    const description = document.createElement('p');
    description.innerHTML = '残しておきたいレアリティにチェック。<br>&quot;,&quot;区切りでアイテム名の指定が可能。アイテム名[属性]で対象の属性も指定。<br>例: どんぐり大砲[火風], どんぐりかたびら<br>属性なしは[無]か[な]。詳細は<a href="https://donguri-k.github.io/tools/chest-opener" target="_blank">こちら</a>を参照';
    description.style.fontSize = '14px';
    div.append(description);
    equipChestField.append(div);
  })();

  // loop options
  const loopField = fieldset.cloneNode();
  details.append(loopField);
  const loopNum = document.createElement('input');
  (()=>{
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = '== 箱を開ける回数 ==';
    div.append(p);
    loopNum.type = 'number';
    loopNum.style.width = '5em';
  
    const loopConds = [
      {value:'max',item:'無制限',checked:true},
      {value:'num',item:loopNum,checked:false},
    ];

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'loopCond';
    radio.classList.add('loopCond');

    const radios = [];
    for(let i=0; i<loopConds.length; i++){
      radios[i] = radio.cloneNode();
      const label = document.createElement('label');
      label.style.display = 'inline-block';
      label.append(radios[i], loopConds[i].item);
      radios[0].checked = true;
      div.append(label);
    }
    loopNum.addEventListener('input',(event)=>{
      if(event.target.value !== ''){
        radios[1].checked = true;
      } else {
        radios[0].checked = true;
      }
    })
    loopField.append(div);
  })();

  // battle chest
  (()=>{
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = '== 残すアイテム ==';
    div.append(p);

    const ranks = {
      Pt:7,
      Au:6,
      Ag:5,
      CuSn:4,
      Cu:3
    };

    const span = document.createElement('span');
    span.style.width = '64px';
    span.style.fontSize = '18px';
    span.style.whiteSpace = 'nowrap';

    const select = document.createElement('select');
    select.style.height = 'fit-content';
    select.style.width = 'fit-content';

    for(const key of Object.keys(ranks)){
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.display.whiteSpace = 'nowrap';
      
      const span_ = span.cloneNode();
      span_.textContent = `[${key}]`;

      const buffSelect = select.cloneNode();
      buffSelect.dataset.rank = key;
      buffSelect.classList.add('min-buffs');
      const debuffSelect = select.cloneNode();
      debuffSelect.dataset.rank = key;
      debuffSelect.classList.add('max-debuffs');

      for(let i=0; i<ranks[key]; i++){
        const buffs = document.createElement('option');
        buffs.value = i;
        buffs.text = i + '以上';
        const debuffs = document.createElement('option');
        debuffs.value = i;
        debuffs.text = i + '以下';
        buffSelect.add(buffs);
        debuffSelect.add(debuffs);
      }
      const option = document.createElement('option');
      option.value = 100;
      option.text = '分解';
      buffSelect.add(option);

      label.append(span_, 'バフ', buffSelect, 'デバフ', debuffSelect);
      div.append(label);
      battleChestField.append(div);
    };

    const description = document.createElement('p');
    description.innerHTML = 'レアリティごとに下限バフ数と上限デバフ数を選択。（不要なものは「分解」を選択）<br>武器・防具と異なりロックはしないので注意';
    description.style.fontSize = '14px';
    div.append(description);
  })();

  const equipChestButton = document.createElement('button');
  equipChestButton.type = 'button';
  equipChestButton.textContent = '開始';
  loopField.append(equipChestButton);

  const battleChestButton = document.createElement('button');
  battleChestButton.type = 'button';
  battleChestButton.textContent = '開始';
  battleChestButton.style.display = 'none';
  loopField.append(battleChestButton);

  const stats = document.createElement('div');
  const count = document.createElement('p');
  const epic = document.createElement('p');
  epic.style.height = '64px';
  epic.style.overflowY = 'auto';
  stats.append(count,epic);

  const credit = document.createElement('div');
  const author = document.createElement('input');
  author.value = '作者 [ID: 7234e634]';
  author.style.fontSize = '9px';
  author.style.border = 'none';
  author.readOnly = 'true';
  author.addEventListener('click',()=>{
    author.select();
    navigator.clipboard.writeText('7234e634');
  })
  const transfer = document.createElement('a');
  transfer.textContent = '→どんぐりを送る';
  transfer.style.fontSize = '12px';
  transfer.style.background = '#212121';
  transfer.style.color = '#ffb300';
  transfer.style.marginLeft = '6px';
  transfer.href = 'https://donguri.5ch.net/transfer';

  credit.append(author, transfer);
  details.append(stats,credit);
  container.append(details);
  document.body.prepend(container);
  loadInputData();

  equipChestButton.addEventListener('click',async function() {
    switchChestField.disabled = true;
    equipChestField.disabled = true;
    loopField.disabled = true;

    // too fast対策の待機
    async function waitRemainingTime(startTime) {
      const elapsed = Date.now() - startTime;
      const remaining = 1200 - elapsed;
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }
    }

    const forceStop = error => {
      switchChestField.disabled = false;
      equipChestField.disabled = false;
      loopField.disabled = false;
      count.textContent = chestCount + ', ' + error;
      console.error(error);
    }

    let chestCount = 0;
    const loopCond = document.querySelector('input[name="loopCond"]:checked').value;
    const maxCount = Number(loopNum.value);

    while (loopCond === 'max' || chestCount < maxCount){
      const startTime = Date.now();
      let stat = 'initial';
      try {
        const response = await fetch('https://donguri.5ch.net/open', {
          method: 'POST',
          body: 'chestsize=B70', /* 小: A65, 大: B70 */
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to open chest');
        }
        const res = await response.text();

        try {
          if (res.includes('Left No room in inventory')){
            throw new Error('Left No room in Inventory');
          }
          if (res.includes('どんぐりが見つかりませんでした。')){
            throw new Error('どんぐりが見つかりませんでした。');
          }
          if (res.includes('too fast')){
            throw new Error('too fast');
          }
          if (res.includes('Left Wrong chest')){
            throw new Error('宝箱がありません。*要不具合報告');
          }
          const parser = new DOMParser();
          const doc = parser.parseFromString(res, 'text/html');

          const title = doc.querySelector('title');
          const h1 = doc.querySelector('h1');

          if (title.textContent.includes('鉄のキーバンドル') || h1.textContent.includes('鉄のキーバンドル')) {
            throw new Error('lessKey');
          }
          if (!h1.textContent.includes('アイテムバッグ')) {
            throw new Error('不明なエラー1');
          }

          if(h1.textContent.includes('アイテムバッグ')){
            const itemLockLinks = doc.querySelectorAll('a[href^="https://donguri.5ch.net/lock/"]');

            for(const elm of itemLockLinks){
              const itemName = elm.closest('tr').firstChild.textContent;
              // URとSSRを表示
              if(itemName.includes('[UR]') || itemName.includes('[SSR]')) {
                const p = document.createElement('p');
                p.textContent = itemName;
                if(itemName.includes('[UR]')) p.style.background = '#f45d01';
                if(itemName.includes('[SSR]')) p.style.background = '#a633d6';
                p.style.color = '#fff';
                p.style.margin = '1px';
                p.style.fontSize = '90%';
                epic.prepend(p);
              }
            }

            if(!shouldNotRecycle.checked){
              // アイテムロック
              try {
                await itemLocking(doc);
              } catch (error) {
                forceStop(error);
                break;
              }

              // 残りを分解
              try {
                const response = await fetch('https://donguri.5ch.net/recycleunlocked', {method: 'POST'});
                if (!response.ok) {
                  throw new Error('Failed to recycle unlocked item');
                }
              } catch(error) {
                forceStop(error);
                break;
              }
            }
            chestCount++;
            count.textContent = chestCount;
            stat = 'success';
          }
          if(stat !== 'success') {
            throw new Error('不明なエラー2');
          }
        } catch (error) {
          forceStop(error);
          break;
        }
        await waitRemainingTime(startTime);
      } catch (error) {
        forceStop(error);
        break;
      }
    }
    switchChestField.disabled = false;
    loopField.disabled = false;
    equipChestField.disabled = false;
  })

  async function itemLocking(doc) {
    const itemLockLinks = doc.querySelectorAll('a[href^="https://donguri.5ch.net/lock/"]');
    const checkedRanks = Array.from(document.querySelectorAll('.keep-item:checked')).map(elm => elm.value);
  
    const itemInputs = document.querySelectorAll('.wishlist');
    const results = [];
  
    itemInputs.forEach(input => {
      const rank = input.dataset.rank;
      const value = input.value.trim();
  
      // 入力値がない場合はそのrankの全てを対象
      const patterns = value
        ? value.split(',').map(item => {
            const match = item.match(/^([^[]*)(?:\[(.+)\])?/);
            return {
              name: match[1].trim(),
              elems: match[2] 
                ? match[2].replace('無', 'な').split('')
                : null,
            };
          })
        : null;
  
      itemLockLinks.forEach(link => {
        const row = link.closest('tr');
        const cells = row.querySelectorAll('td');
        const itemName = cells[0].textContent;
        const itemElem = cells[6].textContent;
  
        if (!checkedRanks.includes(rank)) return;
        if (!itemName.includes(rank)) return;
  
        // 入力値がない場合
        if (!patterns) {
          results.push(link);
          return;
        }
  
        for (const pattern of patterns) {
          if (!itemName.includes(pattern.name)) continue;
          if (pattern.elems && !pattern.elems.some(e=>itemElem.includes(e))) continue;
          results.push(link);
          break;
        }
      });
    });
  
    const promises = results.map(async (link) => {
      const response = await fetch(link.href,{method:'GET'});
      if (!response.ok) {
        throw new Error('Failed to lock item');
      }
    });

    await Promise.all(promises);
  }

  battleChestButton.addEventListener('click',async function () {
    switchChestField.disabled = true;
    loopField.disabled = true;
    battleChestField.disabled = true;

    // too fast対策の待機
    async function waitRemainingTime(startTime) {
      const elapsed = Date.now() - startTime;
      const remaining = 1200 - elapsed;
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }
    }

    const forceStop = error => {
      switchChestField.disabled = false;
      loopField.disabled = false;
      battleChestField.disabled = false;
      count.textContent = chestCount + ', ' + error;
      console.error(error);
    }

    let chestCount = 0;
    const loopCond = document.querySelector('input[name="loopCond"]:checked').value;
    const maxCount = Number(loopNum.value);

    const minBuffs = {};
    document.querySelectorAll('.min-buffs').forEach(elm => {
      const rank = elm.dataset.rank;
      minBuffs[rank] = Number(elm.value);
    });

    const maxDebuffs = {};
    document.querySelectorAll('.max-debuffs').forEach(elm => {
      const rank = elm.dataset.rank;
      maxDebuffs[rank] = Number(elm.value);
    });

    const buffs = ['増幅された','強化された','加速した','高まった','力を増した','クリアになった','増幅された','固くなった','尖らせた'];
    const debuffs = ['静まった','薄まった','弱まった','減速した','減少した','砕けた','ぼやけた','制限された','緩んだ','鈍らせた','侵食された'];
  

    while (loopCond === 'max' || chestCount < maxCount){
      const startTime = Date.now();
      let stat = 'initial';
      try {
        const response = await fetch('https://donguri.5ch.net/openbattlechest', {
          method: 'POST',
          headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        try {
          if (!response.ok) {
            throw new Error('Failed to open chest');
          }
          const res = await response.text();
          if (res.includes('Left No room in inventory')){
            throw new Error('Left No room in Inventory');
          }
          if (res.includes('どんぐりが見つかりませんでした。')){
            throw new Error('どんぐりが見つかりませんでした。');
          }
          if (res.includes('too fast')){
            throw new Error('too fast');
          }
          if (res.includes('Left Not enough battle tokens')){
            throw new Error('Left Not enough battle tokens');
          }
          if (res.includes('Left Wrong chest')){
            throw new Error('宝箱がありません。*要不具合報告');
          }
          const parser = new DOMParser();
          const doc = parser.parseFromString(res, 'text/html');
  
          const h1 = doc.querySelector('h1');
  
          if (!h1.textContent.includes('アイテムバッグ')) {
            throw new Error('不明なエラー1');
          }
  
          if(h1.textContent.includes('アイテムバッグ')){
            const necklaceTable = doc.querySelector('#necklaceTable');
            const lastItem = necklaceTable.rows.item(necklaceTable.rows.length - 1);
            const itemName = lastItem.firstChild.textContent;

            const itemRank = itemName.match(/\[(\w+)\d\]/)[1];

            if(itemRank === 'Pt' || itemRank === 'Au' || itemRank === 'Ag'){
              const p = document.createElement('p');
              p.textContent = itemName;
              if(itemRank === 'Pt') p.style.background = '#f45d01';
              if(itemRank === 'Au') p.style.background = '#a633d6';
              if(itemRank === 'Ag') p.style.background = '#2175d9';
              p.style.color = '#fff';
              p.style.margin = '1px';
              p.style.fontSize = '90%';
              epic.prepend(p);
            }


            if(!shouldNotRecycle.checked){
              const itemEffects = lastItem.querySelectorAll('td')[3].innerText
                .split('\n')
                .map(v => {
                  const match = v.match(/^(.+): (\d+)% (.+)$/);
                  const [, type, value, effect] = match;
                  return [type, effect, value];
                });
              
              const buffCount = itemEffects.filter(effects => buffs.includes(effects[1])).length;
              const debuffCount = itemEffects.filter(effects => debuffs.includes(effects[1])).length;
              // 分解
              if (buffCount < minBuffs[itemRank] || debuffCount > maxDebuffs[itemRank]) {
                try {
                  const recycleLink = lastItem.querySelectorAll('a')[2];
                  const response = await fetch(recycleLink.href);
                  if (!response.ok) {
                    throw new Error('Fail to recycle an item');
                  }
                } catch (error) {
                  forceStop(error);
                  break;
                }
              }
              chestCount++;
              count.textContent = chestCount;
              stat = 'success';
            }
          }

          if(stat !== 'success') {
            throw new Error('不明なエラー2');
          }
        } catch (error) {
          forceStop(error);
          break;
        }
        await waitRemainingTime(startTime);
      } catch (error) {
        forceStop(error);
        break;
      }
    }
    switchChestField.disabled = false;
    loopField.disabled = false;
    battleChestField.disabled = false;
  })

  function saveInputData(){
    const checkedRanks = Array.from(document.querySelectorAll('.keep-item:checked')).map(elm => elm.value);
    const itemInputs = document.querySelectorAll('.wishlist');
    const itemFilters = {};
    itemInputs.forEach(input => {
      itemFilters[input.dataset.rank] = input.value;
    })
    const minBuffs = {};
    document.querySelectorAll('.min-buffs').forEach(elm => {
      const rank = elm.dataset.rank;
      minBuffs[rank] = Number(elm.value);
    });

    const maxDebuffs = {};
    document.querySelectorAll('.max-debuffs').forEach(elm => {
      const rank = elm.dataset.rank;
      maxDebuffs[rank] = Number(elm.value);
    });

    const data = {
      ranks: checkedRanks,
      itemFilters: itemFilters,
      shouldNotRecycle: shouldNotRecycle.checked,
      minBuffs: minBuffs,
      maxDebuffs: maxDebuffs
    }
    localStorage.setItem('chestOpener', JSON.stringify(data));
  }
  function loadInputData(){
    if(localStorage.hasOwnProperty('chestOpener')){
      const data = JSON.parse(localStorage.getItem('chestOpener'));
      if(data.shouldNotRecycle) shouldNotRecycle.checked = true;
      data.ranks.forEach(rank => {
        document.querySelector('.keep-item[value="'+rank+'"]').checked = true;
      })
      for(const [key,value] of Object.entries(data.itemFilters)){
        document.querySelector('.wishlist[data-rank="'+key+'"]').value = value;
      }
      for(const [key,value] of Object.entries(data.minBuffs)){
        document.querySelector('.min-buffs[data-rank="'+key+'"]').value = value;
      }
      for(const [key,value] of Object.entries(data.maxDebuffs)){
        document.querySelector('.max-debuffs[data-rank="'+key+'"]').value = value;
      }
    }
  }
})();
