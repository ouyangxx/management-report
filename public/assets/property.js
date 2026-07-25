(async () => {
const DATA = await fetch('/assets/page-data.json').then(response => response.json());
    const COUNTRY_FIELD = '国家/地区';
    const COUNTRY_TYPES = new Set(['品牌零售','大客户分销','线上平台分销']);
    const BASE_CONFIG_FIELDS = ['品牌','类目','系列','SPU','SKU','平台','店铺','仓库','来源','分销员','客户名称','开票主体（公司名称）','是否直播（0未直播，1直播）','直播UID','BD工号','BD人名','服务商（BD公司名称）','供应商（公司名称）','省份','地市','区县','业态'];
    const CONFIG_FIELDS = BASE_CONFIG_FIELDS;
    const EXPORT_HEADERS = ['经营体链路','经营类型','业态','品牌','类目','系列','SPU','SKU','平台','店铺','仓库','来源','分销员(工号)','分销员(姓名)','客户名称','开票主体（公司名称）','是否直播（0未直播，1直播）','直播UID','BD工号','BD人名','服务商（BD公司名称）','供应商（公司名称）',COUNTRY_FIELD,'省份','地市','区县'];
    const MULTI_FIELDS = new Set(['业态','品牌','类目','系列','SPU','SKU','平台','店铺','来源','分销员','BD人名',COUNTRY_FIELD]);
    const TEXT_FIELDS = DATA.headers.filter(item => !['BG','一级经营体','二级经营体','经营类型','业态','品牌','类目','系列','SPU','SKU','平台','店铺','来源','省份','地市','区县'].includes(item));
    const COUNTRY_REGION_TEXT = `东亚|中国、蒙古、朝鲜、韩国、日本、中国澳门、中国台湾、中国香港
东南亚|菲律宾、越南、老挝、柬埔寨、缅甸、泰国、马来西亚、文莱、新加坡、印度尼西亚、圣诞岛、东帝汶
南亚|尼泊尔、不丹、孟加拉国、印度、巴基斯坦、斯里兰卡、英属印度洋领地、马尔代夫
中亚|哈萨克斯坦、吉尔吉斯斯坦、塔吉克斯坦、乌兹别克斯坦、土库曼斯坦
西亚|阿富汗、伊拉克、伊朗、叙利亚、约旦、黎巴嫩、以色列、巴勒斯坦、沙特阿拉伯、巴林、卡塔尔、科威特、阿联酋、阿曼、也门、格鲁吉亚、亚美尼亚、阿塞拜疆、土耳其、塞浦路斯
北欧|芬兰、瑞典、挪威、冰岛、法罗群岛、丹麦
东欧|爱沙尼亚、拉脱维亚、立陶宛、白俄罗斯、俄罗斯、乌克兰、摩尔多瓦
中欧|波兰、捷克、斯洛伐克、匈牙利、德国、奥地利、瑞士、列支敦士登
西欧|英国、爱尔兰、荷兰、比利时、卢森堡、法国、直布罗陀、泽西岛、根西岛、马恩岛、摩纳哥
南欧|罗马尼亚、保加利亚、塞尔维亚、北马其顿、阿尔巴尼亚、希腊、意大利、梵蒂冈、圣马力诺、马耳他、西班牙、葡萄牙、斯洛文尼亚、克罗地亚、波斯尼亚和黑塞哥维那、黑山、安道尔、马其顿、波黑、科索沃
北非|埃及、利比亚、突尼斯、阿尔及利亚、摩洛哥、加那利群岛、西撒哈拉、苏丹
东非|南苏丹、厄立特里亚、埃塞俄比亚、吉布提、索马里、肯尼亚、乌干达、卢旺达、布隆迪、坦桑尼亚、莫桑比克、赞比亚、津巴布韦、马拉维、马达加斯加、科摩罗、塞舌尔、留尼汪岛、马约特、毛里求斯
西非|毛里塔尼亚、塞内加尔、冈比亚、马里、布基纳法索、几内亚、几内亚比绍、佛得角、塞拉利昂、利比里亚、科特迪瓦、加纳、多哥、贝宁、尼日尔、圣赫勒拿、尼日利亚
中非|乍得、中非共和国、喀麦隆、赤道几内亚、加蓬、刚果（布）、刚果（金）、圣多美和普林西比、中非、刚果(布)、刚果(金)、安哥拉
南非|博茨瓦纳、纳米比亚、南非、斯威士兰、莱索托
北美地区|加拿大、美国、墨西哥、格陵兰岛、百慕大、圣皮埃尔和密克隆
加勒比海地区|阿鲁巴、瓜德罗普、开曼群岛、安提瓜、马提尼克、波多黎各、荷属安的列斯群岛、美属维尔京群岛、英属维尔京、安圭拉、特克斯和凯科斯群岛、库拉索、圣基茨和尼维斯联邦、蒙特塞拉特、巴哈马、古巴、牙买加、海地、多米尼加共和国、安提瓜和巴布达、圣基茨和尼维斯、多米尼克、圣卢西亚、圣文森特和格林纳丁斯、格林纳达、巴巴多斯、特立尼达和多巴哥
中美洲|危地马拉、伯利兹、萨尔瓦多、洪都拉斯、尼加拉瓜、哥斯达黎加、巴拿马
南美洲|哥伦比亚、委内瑞拉、圭亚那、苏里南、厄瓜多尔、秘鲁、巴西、玻利维亚、智利、阿根廷、巴拉圭、乌拉圭、法属圭亚那、福克兰群岛、南乔治亚岛和南桑威奇群岛
澳大利亚及岛屿|澳大利亚、新西兰
美拉尼西亚|巴布亚新几内亚、所罗门群岛、瓦努阿图、斐济、新喀里多尼亚、斐济群岛共和国
密克罗尼西亚|帕劳、密克罗尼西亚联邦、马绍尔群岛共和国、瑙鲁、关岛、马绍尔群岛、密克罗尼西亚、北马里亚纳群岛、瑙鲁共和国、基里巴斯
波利尼西亚|图瓦卢、萨摩亚、汤加、诺福克岛、库克群岛、美属萨摩亚、法属波利尼西亚、瓦利斯和富图纳群岛、纽埃、托克劳
大洋洲|美国本土外小岛屿`;
    const COUNTRY_REGION_TREE = COUNTRY_REGION_TEXT.trim().split('\n').map(line => {
      const [region, countries] = line.split('|');
      return { region, countries: [...new Set(countries.split('、').filter(Boolean))] };
    });
    const COUNTRY_OPTIONS = [...new Set(COUNTRY_REGION_TREE.flatMap(item => item.countries))];
    const state = {
      selectedOrg: null,
      defaultType: DATA.options['经营类型'][0] || '',
      values: Object.fromEntries(Object.entries(DATA.initialSaved || {}).map(([key, entry]) => [key, JSON.parse(JSON.stringify(entry.config))])),
      initialSaved: JSON.parse(JSON.stringify(DATA.initialSaved || {})),
      saved: {},
      modalField: '',
      modalType: '',
      modalRowIndex: 0,
      modalTemp: new Set(),
      platformCountries: new Set(),
      platformGroupKeys: new Set(),
      countryRegions: new Set()
    };

    const byCode = Object.fromEntries(DATA.regions.map(r => [r.code, r]));
    const childrenByParent = DATA.regions.reduce((acc, r) => {
      (acc[r.parent] ||= []).push(r);
      return acc;
    }, {});
    const platformNameMeta = (DATA.platformTree.flat || []).reduce((acc, item) => {
      (acc[item.name] ||= []).push(item);
      return acc;
    }, {});

    function platformGroupKey(country, group) {
      return country + '::' + group;
    }

    function buildTreeData() {
      const root = new Map();
      DATA.orgRows.forEach(row => {
        const path = row.map(item => String(item || '').trim()).filter(Boolean);
        if (path.length < 2) return;
        let current = root;
        path.forEach(label => {
          if (!current.has(label)) current.set(label, new Map());
          current = current.get(label);
        });
      });
      return root;
    }

    const treeData = buildTreeData();

    function node(label, level, path, hasChildren) {
      const div = document.createElement('div');
      div.className = `node level-${level} ${level === 0 ? 'bg' : ''}`;
      div.dataset.path = path.join('>');
      const key = path.join('>');
      let status = '';
      if (level > 0 && state.saved[key]) status = '<span class="configured-tag">已确认配置</span>';
      else if (level > 0 && state.initialSaved[key]) status = '<span class="configured-tag initial-tag">有初始配置</span>';
      div.innerHTML = `<span class="twisty">${hasChildren ? (level === 0 ? '▾' : '▸') : ''}</span><span class="dot"></span><span class="name"></span>${status}`;
      div.querySelector('.name').textContent = label;
      return div;
    }

    function pathMatches(path, children, keyword) {
      if (!keyword) return true;
      if (path.some(name => name.toLowerCase().includes(keyword))) return true;
      let matched = false;
      children.forEach((grandChildren, label) => {
        if (matched) return;
        matched = pathMatches([...path, label], grandChildren, keyword);
      });
      return matched;
    }

    function renderTreeBranch(container, children, path, level, keyword) {
      children.forEach((grandChildren, label) => {
        const nextPath = [...path, label];
        if (!pathMatches(nextPath, grandChildren, keyword)) return;
        const wrap = document.createElement('div');
        const branchNode = node(label, level, nextPath, grandChildren.size > 0);
        wrap.appendChild(branchNode);
        if (grandChildren.size > 0) {
          const box = document.createElement('div');
          box.className = 'children' + (level === 0 || keyword ? '' : ' collapsed');
          renderTreeBranch(box, grandChildren, nextPath, level + 1, keyword);
          wrap.appendChild(box);
        }
        container.appendChild(wrap);
      });
    }

    function renderTree(filter = '') {
      const expandedState = captureTreeExpandedState();
      const tree = document.getElementById('tree');
      tree.innerHTML = '';
      const keyword = filter.trim().toLowerCase();
      renderTreeBranch(tree, treeData, [], 0, keyword);
      bindTree();
      restoreTreeExpandedState(expandedState);
      applyActive();
    }

    
    function captureTreeExpandedState() {
      const result = {};
      document.querySelectorAll('.node').forEach(node => {
        const children = node.nextElementSibling;
        if (children && children.classList.contains('children')) {
          result[node.dataset.path] = !children.classList.contains('collapsed');
        }
      });
      return result;
    }

    function restoreTreeExpandedState(expandedState) {
      document.querySelectorAll('.node').forEach(node => {
        const children = node.nextElementSibling;
        if (!children || !children.classList.contains('children')) return;
        if (!Object.prototype.hasOwnProperty.call(expandedState, node.dataset.path)) return;
        children.classList.toggle('collapsed', !expandedState[node.dataset.path]);
        node.querySelector('.twisty').textContent = expandedState[node.dataset.path] ? '▾' : '▸';
      });
    }

    function bindTree() {
      document.querySelectorAll('.node').forEach(el => {
        el.onclick = () => {
          const path = el.dataset.path.split('>');
          const children = el.nextElementSibling;
          if (children && children.classList.contains('children')) {
            children.classList.toggle('collapsed');
            el.querySelector('.twisty').textContent = children.classList.contains('collapsed') ? '▸' : '▾';
          }
          if (path.length > 1) selectOrg(path);
        };
      });
    }

    function applyActive() {
      document.querySelectorAll('.node').forEach(el => el.classList.toggle('active', state.selectedOrg && el.dataset.path === state.selectedOrg.join('>')));
    }

    function orgKey() {
      return state.selectedOrg ? state.selectedOrg.join('>') : '';
    }

    function ensureOrgValues() {
      const key = orgKey();
      if (!state.values[key]) {
        state.values[key] = { selectedTypes: state.defaultType ? [state.defaultType] : [], groups: {} };
        if (state.defaultType) ensureGroup(state.values[key], state.defaultType);
      }
      return state.values[key];
    }

    function ensureGroup(values, type) {
      if (!values.groups[type]) {
        values.groups[type] = { collapsed: false, rows: [createEmptyRow(type)] };
      }
      if (!values.groups[type].rows) {
        values.groups[type].rows = [createEmptyRow(type)];
        DATA.headers.forEach(h => {
          if (values.groups[type][h]) values.groups[type].rows[0][h] = values.groups[type][h];
        });
      }
      return values.groups[type];
    }

    function createEmptyRow(type) {
      const row = { 经营类型: type };
      CONFIG_FIELDS.forEach(field => row[field] = '');
      row[COUNTRY_FIELD] = '';
      DATA.headers.forEach(field => {
        if (!(field in row)) row[field] = '';
      });
      return row;
    }

    function selectOrg(path) {
      state.selectedOrg = path;
      const values = ensureOrgValues();
      document.getElementById('currentPath').textContent = '当前经营体：' + path.join(' > ');
      renderPanel();
      applyActive();
    }

    function renderPanel() {
      const scrollState = captureGroupScroll();
      const panel = document.getElementById('panel');
      if (!state.selectedOrg) {
        panel.innerHTML = '<div class="empty">请选择左侧一级、二级、三级或四级经营体</div>';
        return;
      }
      const values = ensureOrgValues();
      panel.innerHTML = `
        <div class="type-row">
          <span class="label">经营类型</span>
          ${DATA.options['经营类型'].map(type => `
            <label class="type-option ${values.selectedTypes.includes(type) ? 'active' : ''}">
              <input type="checkbox" name="businessType" value="${escapeAttr(type)}" ${values.selectedTypes.includes(type) ? 'checked' : ''}>
              <span>${escapeHtml(type)}</span>
            </label>
          `).join('')}
        </div>
        <div class="config" id="groups"></div>
      `;
      panel.querySelectorAll('input[name="businessType"]').forEach(input => {
        input.onchange = () => {
          if (input.checked) {
            if (!values.selectedTypes.includes(input.value)) values.selectedTypes.push(input.value);
            ensureGroup(values, input.value).collapsed = false;
          } else {
            removeType(values, input.value);
          }
          renderPanel();
        };
      });
      const groups = document.getElementById('groups');
      if (!values.selectedTypes.length) {
        groups.innerHTML = '<div class="empty">请选择经营类型</div>';
        return;
      }
      values.selectedTypes.forEach(type => {
        groups.appendChild(createBusinessGroup(type, ensureGroup(values, type), values));
      });
      restoreGroupScroll(scrollState);
    }

    function captureGroupScroll() {
      const result = {};
      document.querySelectorAll('.business-group').forEach(group => {
        const body = group.querySelector('.group-body');
        if (body) result[group.dataset.type] = body.scrollLeft;
      });
      return result;
    }

    function restoreGroupScroll(scrollState) {
      document.querySelectorAll('.business-group').forEach(group => {
        const body = group.querySelector('.group-body');
        if (body && Object.prototype.hasOwnProperty.call(scrollState, group.dataset.type)) {
          body.scrollLeft = scrollState[group.dataset.type];
        }
      });
    }

    function removeType(values, type) {
      values.selectedTypes = values.selectedTypes.filter(item => item !== type);
      delete values.groups[type];
    }

    function configFieldsForType(type) {
      if (!COUNTRY_TYPES.has(type)) return BASE_CONFIG_FIELDS;
      return BASE_CONFIG_FIELDS.flatMap(field => field === '业态' ? [COUNTRY_FIELD, field] : [field]);
    }

    function createBusinessGroup(type, group, values) {
      const section = document.createElement('div');
      section.className = 'business-group' + (group.collapsed ? ' collapsed' : '');
      section.dataset.type = type;
      const headerHtml = configFieldsForType(type).map(field => `<th>${escapeHtml(field)}</th>`).join('') + '<th>操作</th>';
      section.innerHTML = `
        <div class="group-head">
          <div class="group-title">${escapeHtml(type)}</div>
          <div class="group-actions">
            <button data-action="delete">删除</button>
            <button data-action="toggle">${group.collapsed ? '展开 ↓' : '收起 ↑'}</button>
          </div>
        </div>
        <div class="group-body">
          <table class="config-table">
            <thead><tr>${headerHtml}</tr></thead>
            <tbody></tbody>
          </table>
        </div>
      `;
      section.querySelector('[data-action="delete"]').onclick = () => {
        removeType(values, type);
        renderPanel();
      };
      section.querySelector('[data-action="toggle"]').onclick = () => {
        group.collapsed = !group.collapsed;
        renderPanel();
      };
      const tbody = section.querySelector('tbody');
      group.rows.forEach((row, index) => {
        tbody.appendChild(createTableRow(type, group, row, index));
      });
      return section;
    }

    function createTableRow(type, group, row, rowIndex) {
      const tr = document.createElement('tr');
      configFieldsForType(type).forEach(field => {
        const td = document.createElement('td');
        td.appendChild(createCell(field, row, type, rowIndex));
        tr.appendChild(td);
      });
      const action = document.createElement('td');
      action.className = 'row-actions';
      const add = document.createElement('button');
      add.type = 'button';
      add.textContent = '+';
      add.onclick = () => {
        group.rows.splice(rowIndex + 1, 0, createEmptyRow(type));
        renderPanel();
      };
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '−';
      remove.disabled = group.rows.length === 1;
      remove.onclick = () => {
        if (group.rows.length <= 1) return;
        group.rows.splice(rowIndex, 1);
        renderPanel();
      };
      action.appendChild(add);
      action.appendChild(remove);
      tr.appendChild(action);
      return tr;
    }

    function createCell(field, values, type, rowIndex) {
      if (MULTI_FIELDS.has(field)) {
        const btn = document.createElement('button');
        btn.className = 'picker-button' + (values[field] ? ' has-value' : '');
        btn.textContent = values[field] || '--';
        btn.onclick = () => openPicker(field, type, rowIndex);
        return btn;
      } else if (field === '省份' || field === '地市' || field === '区县') {
        return regionSelect(field, values, type, rowIndex);
      } else {
        const input = document.createElement('input');
        input.value = values[field] || '';
        input.placeholder = '--';
        input.oninput = () => values[field] = input.value;
        return input;
      }
    }

    function regionSelect(field, values, type, rowIndex) {
      const select = document.createElement('select');
      const level = field === '省份' ? 1 : field === '地市' ? 2 : 3;
      let list = [];
      if (level === 1) list = DATA.regions.filter(r => r.level === 1);
      if (level === 2) {
        const province = DATA.regions.find(r => r.name === values['省份'] && r.level === 1);
        list = province ? (childrenByParent[province.code] || []) : [];
      }
      if (level === 3) {
        const city = DATA.regions.find(r => r.name === values['地市'] && r.level === 2);
        list = city ? (childrenByParent[city.code] || []) : [];
      }
      select.innerHTML = '<option value="">请选择</option>' + list.map(r => `<option value="${escapeAttr(r.name)}" ${values[field] === r.name ? 'selected' : ''}>${escapeHtml(r.name)}</option>`).join('');
      select.onchange = () => {
        values[field] = select.value;
        if (field === '省份') { values['地市'] = ''; values['区县'] = ''; }
        if (field === '地市') values['区县'] = '';
        renderPanel();
      };
      return select;
    }

    function openPicker(field, type, rowIndex) {
      const values = ensureOrgValues();
      const group = ensureGroup(values, type);
      const row = group.rows[rowIndex] || group.rows[0];
      state.modalField = field;
      state.modalType = type;
      state.modalRowIndex = rowIndex;
      state.modalTemp = new Set((row[field] || '').split('、').filter(Boolean));
      initPlatformFilters();
      initCountryFilters();
      document.getElementById('modalTitle').textContent = type + ' / ' + field;
      document.getElementById('optionSearch').value = '';
      document.getElementById('smartInput').value = '';
      updateSmartBox();
      document.getElementById('modal').classList.add('show');
      renderTags();
    }

    function renderTags() {
      if (state.modalField === '平台') {
        renderPlatformCascade();
        return;
      }
      if (state.modalField === COUNTRY_FIELD) {
        renderCountryCascade();
        return;
      }
      const field = state.modalField;
      const keyword = document.getElementById('optionSearch').value.trim().toLowerCase();
      const list = document.getElementById('tagList');
      const source = optionSource(field, state.modalType);
      const selected = Array.from(state.modalTemp);
      const filtered = source.filter(v => !state.modalTemp.has(v) && (!keyword || v.toLowerCase().includes(keyword))).slice(0, Math.max(0, 500 - selected.length));
      const visibleOptions = [...selected, ...filtered];
      const addStoreValue = field === '店铺' ? storeNameToAdd(document.getElementById('optionSearch').value, source) : '';
      const addStoreButton = addStoreValue ? `<button class="tag add-store" data-add-store="${escapeAttr(addStoreValue)}">添加店铺：${escapeHtml(addStoreValue)}</button>` : '';
      list.innerHTML = addStoreButton + visibleOptions.map(v => `<button class="tag ${state.modalTemp.has(v) ? 'selected' : ''}" data-value="${escapeAttr(v)}">${escapeHtml(v)}</button>`).join('');
      list.querySelectorAll('[data-add-store]').forEach(tag => {
        tag.onclick = () => addCustomStore(tag.dataset.addStore);
      });
      list.querySelectorAll('.tag').forEach(tag => {
        if (tag.dataset.addStore) return;
        tag.onclick = () => {
          const value = tag.dataset.value;
          if (state.modalTemp.has(value)) state.modalTemp.delete(value);
          else state.modalTemp.add(value);
          tag.classList.toggle('selected');
        };
      });
    }

    function updateSmartBox() {
      const box = document.getElementById('smartBox');
      const cascade = document.getElementById('platformCascade');
      const countryCascade = document.getElementById('countryCascade');
      const selectedBox = document.getElementById('platformSelectedBox');
      const tagList = document.getElementById('tagList');
      box.classList.toggle('show', state.modalField === '店铺');
      cascade.classList.toggle('show', state.modalField === '平台');
      countryCascade.classList.toggle('show', state.modalField === COUNTRY_FIELD);
      selectedBox.classList.toggle('show', state.modalField === '平台' || state.modalField === COUNTRY_FIELD);
      tagList.classList.toggle('hidden', state.modalField === '平台' || state.modalField === COUNTRY_FIELD);
      document.querySelector('#modal .dialog').classList.toggle('platform-dialog', state.modalField === '平台');
      document.querySelector('#modal .dialog').classList.toggle('country-dialog', state.modalField === COUNTRY_FIELD);
      document.getElementById('selectedTitle').textContent = state.modalField === COUNTRY_FIELD ? '已选国家/地区' : '已选平台';
      document.getElementById('smartTip').textContent = '按英文逗号分割，自动选中匹配到的店铺';
    }

    function initPlatformFilters() {
      state.platformCountries = new Set();
      state.platformGroupKeys = new Set();
      syncPlatformParentsFromSelected();
    }

    function initCountryFilters() {
      state.countryRegions = new Set();
      syncCountryParentsFromSelected();
    }

    function syncPlatformParentsFromSelected() {
      state.platformCountries = new Set();
      state.platformGroupKeys = new Set();
      const groupsByCountry = DATA.platformTree.groups || {};
      Object.entries(groupsByCountry).forEach(([country, groupMap]) => {
        let allGroupsSelected = true;
        Object.entries(groupMap).forEach(([group, names]) => {
          const key = platformGroupKey(country, group);
          const groupSelected = names.length > 0 && names.every(name => state.modalTemp.has(name));
          if (groupSelected) state.platformGroupKeys.add(key);
          else allGroupsSelected = false;
        });
        if (Object.keys(groupMap).length && allGroupsSelected) state.platformCountries.add(country);
      });
    }

    function smartRecognizeStores() {
      if (state.modalField !== '店铺') return;
      const raw = document.getElementById('smartInput').value;
      const names = raw.split(/[,，\n\r\t]+/).map(item => item.trim()).filter(Boolean);
      const options = optionSource('店铺', state.modalType);
      let matched = 0;
      let added = 0;
      names.forEach(name => {
        const normalizedName = normalizeStoreName(name);
        const hits = options.filter(option => {
          const normalizedOption = normalizeStoreName(option);
          return normalizedOption === normalizedName || normalizedOption.includes(normalizedName) || normalizedName.includes(normalizedOption);
        });
        if (hits.length) {
          hits.forEach(value => {
            if (!state.modalTemp.has(value)) {
              state.modalTemp.add(value);
              matched += 1;
            }
          });
        } else if (addCustomStore(name, false)) {
          added += 1;
        }
      });
      document.getElementById('smartTip').textContent = `识别到 ${names.length} 个，匹配选中 ${matched} 个，新增 ${added} 个`;
      document.getElementById('optionSearch').value = '';
      renderTags();
    }

    function normalizeStoreName(value) {
      return String(value).trim().toLowerCase();
    }

    function storeNameToAdd(value, options) {
      const name = String(value || '').trim();
      if (!name) return '';
      const normalized = normalizeStoreName(name);
      const exists = [...options, ...state.modalTemp].some(option => normalizeStoreName(option) === normalized);
      return exists ? '' : name;
    }

    function addCustomStore(name, shouldRender = true) {
      const value = String(name || '').trim();
      if (!value) return false;
      const exists = Array.from(state.modalTemp).some(item => normalizeStoreName(item) === normalizeStoreName(value));
      if (exists) return false;
      state.modalTemp.add(value);
      document.getElementById('smartTip').textContent = `已添加店铺：${value}`;
      document.getElementById('optionSearch').value = '';
      if (shouldRender) renderTags();
      return true;
    }

    function platformVisibleCountries() {
      const countries = DATA.platformTree.countries || [];
      return state.platformCountries.size ? countries.filter(country => state.platformCountries.has(country)) : countries;
    }

    function platformGroupItems() {
      const keyword = document.getElementById('optionSearch').value.trim().toLowerCase();
      const result = [];
      platformVisibleCountries().forEach(country => {
        Object.entries((DATA.platformTree.groups || {})[country] || {}).forEach(([group, names]) => {
          const groupMatched = !keyword || group.toLowerCase().includes(keyword);
          const nameMatched = names.some(name => name.toLowerCase().includes(keyword));
          if (groupMatched || nameMatched) result.push({ country, group, names });
        });
      });
      return result;
    }

    function platformVisibleNames() {
      const keyword = document.getElementById('optionSearch').value.trim().toLowerCase();
      const activeGroupKeys = new Set(platformGroupItems().map(item => platformGroupKey(item.country, item.group)));
      const hasGroupFilter = state.platformGroupKeys.size > 0;
      const names = [];
      const seen = new Set();
      (DATA.platformTree.flat || []).forEach(item => {
        const key = platformGroupKey(item.country, item.group);
        if (!activeGroupKeys.has(key)) return;
        if (hasGroupFilter && !state.platformGroupKeys.has(key)) return;
        if (keyword && !item.group.toLowerCase().includes(keyword) && !item.name.toLowerCase().includes(keyword)) return;
        if (seen.has(item.name)) return;
        seen.add(item.name);
        names.push(item.name);
      });
      return names;
    }

    function platformNamesByCountry(country) {
      return (DATA.platformTree.flat || []).filter(item => item.country === country).map(item => item.name);
    }

    function platformNamesByGroupKey(key) {
      return (DATA.platformTree.flat || []).filter(item => platformGroupKey(item.country, item.group) === key).map(item => item.name);
    }

    function countryItems() {
      const keyword = document.getElementById('optionSearch').value.trim().toLowerCase();
      return COUNTRY_REGION_TREE.filter(item => {
        if (!keyword) return true;
        return item.region.toLowerCase().includes(keyword) || item.countries.some(name => name.toLowerCase().includes(keyword));
      });
    }

    function countryVisibleNames() {
      const keyword = document.getElementById('optionSearch').value.trim().toLowerCase();
      const visibleRegions = new Set(countryItems().map(item => item.region));
      const names = [];
      const seen = new Set();
      COUNTRY_REGION_TREE.forEach(item => {
        if (!visibleRegions.has(item.region)) return;
        item.countries.forEach(name => {
          if (keyword && !item.region.toLowerCase().includes(keyword) && !name.toLowerCase().includes(keyword)) return;
          if (seen.has(name)) return;
          seen.add(name);
          names.push(name);
        });
      });
      return names;
    }

    function countryNamesByRegion(region) {
      const item = COUNTRY_REGION_TREE.find(entry => entry.region === region);
      return item ? item.countries : [];
    }

    function syncCountryParentsFromSelected() {
      state.countryRegions = new Set();
      COUNTRY_REGION_TREE.forEach(item => {
        if (item.countries.length && item.countries.every(name => state.modalTemp.has(name))) {
          state.countryRegions.add(item.region);
        }
      });
    }

    function renderSelectedCountries() {
      const selectedList = document.getElementById('selectedPlatformList');
      if (!selectedList) return;
      const selected = COUNTRY_OPTIONS.filter(name => state.modalTemp.has(name));
      selectedList.innerHTML = selected.length ? selected.map(name => `<button class="tag selected" data-selected-country="${escapeAttr(name)}">${escapeHtml(name)} ×</button>`).join('') : '<div class="cascade-empty">暂无已选国家/地区</div>';
      selectedList.querySelectorAll('[data-selected-country]').forEach(btn => {
        btn.onclick = () => {
          state.modalTemp.delete(btn.dataset.selectedCountry);
          syncCountryParentsFromSelected();
          renderCountryCascade();
        };
      });
    }

    function renderCountryCascade() {
      const regionList = document.getElementById('countryRegionList');
      const nameList = document.getElementById('countryNameList');
      const regions = countryItems();
      const visibleNames = countryVisibleNames();
      regionList.innerHTML = regions.length ? regions.map(item => `<button class="cascade-item ${state.countryRegions.has(item.region) ? 'selected' : ''}" data-region="${escapeAttr(item.region)}">${escapeHtml(item.region)}<span class="count">${item.countries.length}</span></button>`).join('') : '<div class="cascade-empty">暂无区域</div>';
      nameList.innerHTML = visibleNames.length ? visibleNames.map(name => `<button class="cascade-item ${state.modalTemp.has(name) ? 'selected' : ''}" data-country-name="${escapeAttr(name)}">${escapeHtml(name)}</button>`).join('') : '<div class="cascade-empty">暂无国家/地区</div>';
      renderSelectedCountries();
      regionList.querySelectorAll('[data-region]').forEach(btn => {
        btn.onclick = () => {
          const region = btn.dataset.region;
          const names = countryNamesByRegion(region);
          if (state.countryRegions.has(region)) {
            state.countryRegions.delete(region);
            names.forEach(name => state.modalTemp.delete(name));
          } else {
            state.countryRegions.add(region);
            names.forEach(name => state.modalTemp.add(name));
          }
          syncCountryParentsFromSelected();
          renderCountryCascade();
        };
      });
      nameList.querySelectorAll('[data-country-name]').forEach(btn => {
        btn.onclick = () => {
          const name = btn.dataset.countryName;
          if (state.modalTemp.has(name)) state.modalTemp.delete(name);
          else state.modalTemp.add(name);
          syncCountryParentsFromSelected();
          renderCountryCascade();
        };
      });
    }

    function renderSelectedPlatforms() {
      const selectedList = document.getElementById('selectedPlatformList');
      if (!selectedList) return;
      const selected = DATA.options['平台'].filter(name => state.modalTemp.has(name));
      selectedList.innerHTML = selected.length ? selected.map(name => `<button class="tag selected" data-selected-platform="${escapeAttr(name)}">${escapeHtml(name)} ×</button>`).join('') : '<div class="cascade-empty">暂无已选平台</div>';
      selectedList.querySelectorAll('[data-selected-platform]').forEach(btn => {
        btn.onclick = () => {
          state.modalTemp.delete(btn.dataset.selectedPlatform);
          syncPlatformParentsFromSelected();
          renderPlatformCascade();
        };
      });
    }

    function renderPlatformCascade() {
      const countryList = document.getElementById('platformCountryList');
      const groupList = document.getElementById('platformGroupList');
      const nameList = document.getElementById('platformNameList');
      const groups = platformGroupItems();
      const visibleNames = platformVisibleNames();
      countryList.innerHTML = (DATA.platformTree.countries || []).map(country => {
        const count = Object.values((DATA.platformTree.groups || {})[country] || {}).reduce((sum, items) => sum + items.length, 0);
        return `<button class="cascade-item ${state.platformCountries.has(country) ? 'selected' : ''}" data-country="${escapeAttr(country)}">${escapeHtml(country)}<span class="count">${count}</span></button>`;
      }).join('');
      groupList.innerHTML = groups.length ? groups.map(item => {
        const key = platformGroupKey(item.country, item.group);
        return `<button class="cascade-item ${state.platformGroupKeys.has(key) ? 'selected' : ''}" data-group-key="${escapeAttr(key)}">${escapeHtml(item.group)}<span class="count">${escapeHtml(item.country)} / ${item.names.length}</span></button>`;
      }).join('') : '<div class="cascade-empty">暂无百大平台</div>';
      nameList.innerHTML = visibleNames.length ? visibleNames.map(name => `<button class="cascade-item ${state.modalTemp.has(name) ? 'selected' : ''}" data-name="${escapeAttr(name)}">${escapeHtml(name)}</button>`).join('') : '<div class="cascade-empty">暂无平台</div>';
      renderSelectedPlatforms();
      countryList.querySelectorAll('[data-country]').forEach(btn => {
        btn.onclick = () => {
          const country = btn.dataset.country;
          if (state.platformCountries.has(country)) {
            state.platformCountries.delete(country);
            Object.keys((DATA.platformTree.groups || {})[country] || {}).forEach(group => state.platformGroupKeys.delete(platformGroupKey(country, group)));
            platformNamesByCountry(country).forEach(name => state.modalTemp.delete(name));
          } else {
            state.platformCountries.add(country);
            Object.keys((DATA.platformTree.groups || {})[country] || {}).forEach(group => state.platformGroupKeys.add(platformGroupKey(country, group)));
            platformNamesByCountry(country).forEach(name => state.modalTemp.add(name));
          }
          renderPlatformCascade();
        };
      });
      groupList.querySelectorAll('[data-group-key]').forEach(btn => {
        btn.onclick = () => {
          const key = btn.dataset.groupKey;
          if (state.platformGroupKeys.has(key)) {
            state.platformGroupKeys.delete(key);
            platformNamesByGroupKey(key).forEach(name => state.modalTemp.delete(name));
          } else {
            state.platformGroupKeys.add(key);
            platformNamesByGroupKey(key).forEach(name => state.modalTemp.add(name));
          }
          renderPlatformCascade();
        };
      });
      nameList.querySelectorAll('[data-name]').forEach(btn => {
        btn.onclick = () => {
          const name = btn.dataset.name;
          if (state.modalTemp.has(name)) state.modalTemp.delete(name);
          else state.modalTemp.add(name);
          syncPlatformParentsFromSelected();
          renderPlatformCascade();
        };
      });
    }

    function optionSource(field, type) {
      if (field === '业态') return DATA.formatOptionsByType[type] || DATA.options[field] || [];
      if (field === COUNTRY_FIELD) return COUNTRY_OPTIONS;
      if (field === '分销员') return DATA.employeeOptions || [];
      if (field === 'BD人名') return DATA.bdOptions || [];
      return DATA.options[field] || [];
    }

    function closePicker() {
      document.getElementById('modal').classList.remove('show');
      document.querySelector('#modal .dialog').classList.remove('platform-dialog');
      document.querySelector('#modal .dialog').classList.remove('country-dialog');
    }

    function confirmPicker() {
      const values = ensureOrgValues();
      const group = ensureGroup(values, state.modalType);
      const row = group.rows[state.modalRowIndex] || group.rows[0];
      row[state.modalField] = Array.from(state.modalTemp).join('、');
      closePicker();
      renderPanel();
    }

    function cloneConfig(value) {
      return JSON.parse(JSON.stringify(value));
    }

    async function loadSharedConfig() {
      try {
        const response = await fetch('/api/shared-config', { cache: 'no-store' });
        if (!response.ok) throw new Error('共享配置加载失败');
        const data = await response.json();
        state.saved = data.saved || {};
        Object.entries(state.saved).forEach(([key, entry]) => {
          if (entry && entry.config) state.values[key] = cloneConfig(entry.config);
        });
      } catch (error) {
        console.warn(error);
      }
    }

    async function saveCurrentConfig() {
      if (!state.selectedOrg) return;
      const key = orgKey();
      const entry = {
        path: [...state.selectedOrg],
        config: cloneConfig(ensureOrgValues())
      };
      const button = document.getElementById('saveBtn');
      button.disabled = true;
      button.textContent = '确认中...';
      try {
        const response = await fetch('/api/shared-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            entry,
            rows: rowsForSavedEntry(entry)
          })
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || '确认配置失败');
        }
        const data = await response.json();
        state.saved = data.saved || { ...state.saved, [key]: entry };
        state.saved[key] = entry;
      } catch (error) {
        alert(error instanceof Error ? error.message : '确认配置失败');
        return;
      } finally {
        button.disabled = false;
        button.textContent = '确认配置';
      }
      renderTree(document.getElementById('orgSearch').value);
      updateSavedCount();
    }

    function updateSavedCount() {
      const count = Object.keys(state.saved).length;
      document.getElementById('savedCount').textContent = `已确认${count}个经营体的产权配置`;
    }

    function exportValue(value) {
      return String(value || '').split('、').map(item => item.trim()).filter(Boolean).join(',');
    }

    function splitCodeName(value) {
      const items = String(value || '').split('、').map(item => item.trim()).filter(Boolean);
      return {
        codes: items.map(item => item.split('～')[0] || '').filter(Boolean).join(','),
        names: items.map(item => item.split('～').slice(1).join('～') || '').filter(Boolean).join(',')
      };
    }

    function rowsForSavedEntry(entry) {
      const rows = [];
      const path = entry.path || [];
      const values = entry.config;
      const types = values && values.selectedTypes ? values.selectedTypes : [];
      types.forEach(type => {
        const group = values.groups && values.groups[type] ? values.groups[type] : { rows: [createEmptyRow(type)] };
        group.rows.forEach(configRow => {
          const record = {};
          EXPORT_HEADERS.forEach(h => record[h] = exportValue(configRow[h] || ''));
          record['经营体链路'] = path.filter(Boolean).join('>');
          record['经营类型'] = type;
          const employees = splitCodeName(configRow['分销员']);
          record['分销员(工号)'] = exportValue(configRow['分销员(工号)']) || employees.codes;
          record['分销员(姓名)'] = exportValue(configRow['分销员(姓名)']) || employees.names;
          const bdRaw = configRow['BD人名'] || '';
          if (bdRaw.includes('～')) {
            const bd = splitCodeName(bdRaw);
            record['BD工号'] = exportValue(configRow['BD工号']) || bd.codes;
            record['BD人名'] = bd.names;
          }
          rows.push(EXPORT_HEADERS.map(h => record[h] || ''));
        });
      });
      return rows;
    }

    function timestampString() {
      const d = new Date();
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    }

    function downloadConfig() {
      const a = document.createElement('a');
      a.href = `/api/shared-config/download?t=${Date.now()}`;
      a.download = '已配置经营体产权.xls';
      a.click();
    }

    function oldDownloadConfig() {
      const values = state.selectedOrg ? ensureOrgValues() : null;
      const path = state.selectedOrg || ['', '', ''];
      const rows = [EXPORT_HEADERS];
      const types = values ? values.selectedTypes : [];
      if (!types.length) types.push('');
      types.forEach(type => {
        const group = values && type ? ensureGroup(values, type) : { rows: [createEmptyRow(type)] };
        group.rows.forEach(configRow => {
          const record = {};
          EXPORT_HEADERS.forEach(h => record[h] = configRow[h] || '');
          record['BG'] = path[0] || '';
          record['一级经营体'] = path[1] || '';
          record['二级经营体'] = path[2] || '';
          record['经营类型'] = type;
          if (configRow['分销员']) {
            const parts = configRow['分销员'].split('～');
            record['分销员(工号)'] = parts[0] || '';
            record['分销员(姓名)'] = parts.slice(1).join('～') || '';
          }
          rows.push(EXPORT_HEADERS.map(h => record[h] || ''));
        });
      });
      while (rows.length < 19) rows.push(EXPORT_HEADERS.map(() => ''));
      const widths = [150, 220, 220, 200, 190, 180, 180, 180, 180, 160, 160, 160, 220, 160, 160, 170, 170, 220, 240, 220, 160, 160, 240, 240, 150, 150, 150];
      const colgroup = EXPORT_HEADERS.map((_, index) => `<col style="width:${widths[index] || 160}px">`).join('');
      const table = rows.map((row, rowIndex) => '<tr>' + row.map(cell => {
        const tag = rowIndex === 0 ? 'th' : 'td';
        return `<${tag}>${escapeHtml(cell)}</${tag}>`;
      }).join('') + '</tr>').join('');
      const excel = `<html><head><meta charset="UTF-8"><style>
        table { border-collapse: collapse; table-layout: fixed; font-family: "Microsoft YaHei", Arial, sans-serif; }
        th { height: 30px; background: #08a9e8; color: #ffffff; font-size: 16px; font-weight: 700; text-align: left; vertical-align: middle; border: 1px solid #e6e6e6; padding: 3px 6px; mso-number-format: "\\@"; }
        td { height: 28px; color: #222222; font-size: 12px; text-align: left; vertical-align: middle; border: 1px solid #e6e6e6; padding: 2px 6px; mso-number-format: "\\@"; }
      </style></head><body><table>${colgroup}${table}</table></body></html>`;
      const blob = new Blob([excel], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const chain = (state.selectedOrg && state.selectedOrg.length ? state.selectedOrg.join('_') : '经营体链路').replace(/[\\/:*?"<>|]/g, '_');
      a.download = chain + '_产权.xls';
      a.click();
      URL.revokeObjectURL(url);
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }

    function escapeAttr(value) { return escapeHtml(value); }

    document.getElementById('orgSearch').oninput = e => renderTree(e.target.value);
    document.getElementById('closeModal').onclick = closePicker;
    document.getElementById('cancelModal').onclick = closePicker;
    document.getElementById('confirmModal').onclick = confirmPicker;
    document.getElementById('optionSearch').oninput = renderTags;
    document.getElementById('smartBtn').onclick = smartRecognizeStores;
    document.getElementById('selectAll').onclick = () => {
      if (state.modalField === '平台') {
        platformVisibleNames().forEach(v => state.modalTemp.add(v));
        syncPlatformParentsFromSelected();
        renderPlatformCascade();
        return;
      }
      if (state.modalField === COUNTRY_FIELD) {
        countryVisibleNames().forEach(v => state.modalTemp.add(v));
        syncCountryParentsFromSelected();
        renderCountryCascade();
        return;
      }
      const keyword = document.getElementById('optionSearch').value.trim().toLowerCase();
      const filtered = optionSource(state.modalField, state.modalType).filter(v => !keyword || v.toLowerCase().includes(keyword)).slice(0, 500);
      if (state.modalField === '分销员') {
        state.modalTemp.clear();
        if (filtered[0]) state.modalTemp.add(filtered[0]);
      } else {
        filtered.forEach(v => state.modalTemp.add(v));
      }
      renderTags();
    };
    document.getElementById('clearSelected').onclick = () => {
      state.modalTemp.clear();
      if (state.modalField === '平台') {
        state.platformCountries.clear();
        state.platformGroupKeys.clear();
      }
      if (state.modalField === COUNTRY_FIELD) {
        state.countryRegions.clear();
      }
      renderTags();
    };
    document.getElementById('saveBtn').onclick = saveCurrentConfig;
    document.getElementById('downloadBtn').onclick = downloadConfig;

    await loadSharedConfig();
    renderTree();
    updateSavedCount();
    const firstConfiguredKey = Object.keys(state.saved)[0] || Object.keys(state.initialSaved)[0];
    const first = firstConfiguredKey ? firstConfiguredKey.split('>') : (DATA.orgRows.find(row => row[0] && row[1]) || []).map(item => String(item || '').trim()).filter(Boolean);
    if (first.length) selectOrg(first);
})().catch(error => {
  console.error(error);
  const panel = document.getElementById('panel');
  if (panel) panel.innerHTML = '<div class="empty">页面加载失败，请刷新重试</div>';
});
