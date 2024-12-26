// ==UserScript==
// @name         donguri Chest Opener
// @version      1.1a
// @description  Automated box opening and recycling
// @author       7234e634
// @match        https://donguri.5ch.net/bag
// @match        https://donguri.5ch.net/chest
// ==/UserScript==

(()=>{
  const container = document.createElement('div');
  const details = document.createElement('details');
  details.classList.add('chest-opener');
  details.style.background = '#ddd';
  const summary = document.createElement('summary');
  summary.textContent = 'Chest Opener v1.1a';

  const options = document.createElement('div');
  const label_recycle = document.createElement('label');
  label_recycle.style.fontSize = '16px';
  const shouldNotRecycle = document.createElement('input');
  shouldNotRecycle.type = 'checkbox';
  label_recycle.append(shouldNotRecycle, 'ロック・分解しないモード');
  options.append(label_recycle);

  const itemSettings = document.createElement('div');
  const items_ = document.createElement('p');
  items_.textContent = '== 残すアイテム([錠]) ==';
  itemSettings.append(items_);

  const ranks = ['[UR]','[SSR]','[SR]','[R]','[N]'];
  for(const v of ranks){
    const label = document.createElement('label');
    label.style.display = 'flex';
    const span = document.createElement('span');
    span.style.width = '64px';
    span.style.fontSize = '18px';
    span.style.whiteSpace = 'nowrap';
    const chkbox = document.createElement('input');
    chkbox.type = 'checkbox';
    chkbox.value = v;
    chkbox.style.height = '18px';
    chkbox.style.width = '18px';
    chkbox.classList.add('keep-item');
    span.append(chkbox,v);
    const input = document.createElement('input');
    input.dataset.rank = v;
    input.style.flex = '1';
    input.style.marginRight = '0';
    input.style.fontSize = '80%';
    input.classList.add('wishlist');
    label.append(span,input);
    itemSettings.append(label);

    input.addEventListener('input',()=>{
      if(input.value !== ''){
        chkbox.checked = true;
      }
    })
  };
  const itemDescription = document.createElement('p');
  itemDescription.innerHTML = '&quot;,&quot;区切りでアイテム名の指定が可能。アイテム名[属性]で対象の属性も指定。<br>例: どんぐり大砲[火風], どんぐりかたびら<br>属性なしは[無]か[な]。詳細は<a href="https://donguri-k.github.io/tools/chest-opener" target="_blank">こちら</a>を参照';
  itemDescription.style.fontSize = '14px';
  itemSettings.append(itemDescription);

  const loopSelect = document.createElement('div');
  const loops_ = document.createElement('p');
  loops_.textContent = '== 大箱を開ける回数 ==';
  loopSelect.append(loops_);
  const loopNum = document.createElement('input');
  loopNum.type = 'number';
  loopNum.style.width = '5em';
  loopNum.addEventListener('input',()=>{

  })

  const loopConds = [
    {value:'max',item:'無制限',checked:true},
    {value:'num',item:loopNum,checked:false},
  ];
  const loopRadios = [];
  for(let i=0; i<loopConds.length; i++){
    loopRadios[i] = document.createElement('input');
    loopRadios[i].type = 'radio';
    loopRadios[i].name = 'loopCond';
    loopRadios[i].classList.add('loopCond');
    loopRadios[i].value = loopConds[i].value;
    loopRadios[i].checked = loopConds[i].checked;
    const label = document.createElement('label');
    label.style.display = 'inline-block';
    label.append(loopRadios[i], loopConds[i].item);
    loopSelect.append(label);
  }
  loopNum.addEventListener('input',(event)=>{
    if(event.target.value !== ''){
      loopRadios[1].checked = true;
    } else {
      loopRadios[0].checked = true;
    }
  })

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = '開始';
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
  details.append(summary,options,itemSettings,loopSelect,btn,stats,credit);
  container.append(details);
  document.body.prepend(container);
  loadInputData();

  btn.addEventListener('click',async function() {
    btn.disabled = true;
    saveInputData();

    // too fast対策の待機
    async function waitRemainingTime(startTime) {
      const elapsed = Date.now() - startTime;
      const remaining = 1000 - elapsed;
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }
    }

    const forceStop = error => {
      btn.disabled = false;
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
                epic.prepend(p);
              }
            }

            if(!shouldNotRecycle.checked){
              // アイテムロック
              try {
                itemLocking(doc);
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
    btn.disabled = false;
  })

  function itemLocking(doc) {
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
  
    results.forEach(async link => {
      const response = await fetch(link.href,{method:'GET'});
      if (!response.ok) {
        throw new Error('Failed to lock item');
      }
    })
  }

  function saveInputData(){
    const checkedRanks = Array.from(document.querySelectorAll('.keep-item:checked')).map(elm => elm.value);
    const itemInputs = document.querySelectorAll('.wishlist');
    const itemFilters = {};
    itemInputs.forEach(input => {
      itemFilters[input.dataset.rank] = input.value;
    })
    const data = {
      ranks: checkedRanks,
      itemFilters: itemFilters,
      shouldNotRecycle: shouldNotRecycle.checked
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
    }
  }
})();



