/* Shared graph presentation. Series values and axes are not changed. */
(function () {
  'use strict';
  const colours = ['#39d9e6', '#ffc66d', '#c6a6ff', '#ff8b98', '#a8e284', '#8abaff', '#f4f4f4'];
  const shapes = ['rect', 'triangle', 'circle', 'rectRot', 'crossRot', 'star', 'cross'];
  const patterns = [[], [12, 5], [3, 4], [12, 4, 3, 4], [2, 4, 2, 4, 10, 4]];
  const escape = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mark(shape, colour, dash) {
    const body = shape === 'crossRot' ? '<path d="M22 4L34 16M34 4L22 16" fill="none" stroke="'+colour+'" stroke-width="3"/>' : shape === 'cross' ? '<path d="M22 10H34M28 4V16" fill="none" stroke="'+colour+'" stroke-width="3"/>' : shape === 'star' ? '<path d="M28 2L30 7L36 7L32 11L34 17L28 14L22 17L24 11L20 7L26 7Z"/>' : shape === 'triangle' ? '<path d="M28 3L35 16H21Z"/>' : shape === 'circle' ? '<circle cx="28" cy="10" r="6"/>' : shape === 'rectRot' ? '<path d="M28 2L36 10L28 18L20 10Z"/>' : '<rect x="22" y="4" width="12" height="12"/>';
    return '<svg viewBox="0 0 56 20" width="56" height="20" aria-hidden="true"><path d="M1 10H55" fill="none" stroke="'+colour+'" stroke-width="2.5" stroke-dasharray="'+dash.join(' ')+'"/><g fill="'+colour+'" stroke="#0a1628" stroke-width="1.4">'+body+'</g></svg>';
  }
  function install() {
    if (!window.Chart || window.Chart.registry.plugins.get('wq-readable-curves')) return;
    Chart.register({
      id: 'wq-readable-curves',
      beforeInit(chart) {
        const ds = chart.data.datasets;
        const allLabels = (document.documentElement.dataset.wqGraphLabels || '').split('|');
        const getCC = s => String(s).match(/([\d.]+)\s*(?:cc|cm³)/i)?.[1] || '';
        const getRPM = s => Number(String(s).replace(/,/g,'').match(/(\d+)\s*rpm/i)?.[1] || 0);
        const displacements = [...new Set(allLabels.map(getCC).filter(Boolean))].sort((a,b)=>Number(b)-Number(a));
        const speeds = [...new Set(allLabels.map(getRPM).filter(Boolean))].sort((a,b)=>b-a);
        const multi = displacements.length > 1;
        ds.forEach((d, i) => {
          const cc = getCC(d.label), rpm = getRPM(d.label);
          const ci = Math.max(0, multi ? displacements.indexOf(cc) : speeds.indexOf(rpm));
          const ri = Math.max(0, speeds.indexOf(rpm));
          d.borderColor = colours[ci % colours.length];
          d.backgroundColor = 'transparent';
          d.pointStyle = shapes[ci % shapes.length];
          d.pointBackgroundColor = d.borderColor;
          d.pointBorderColor = '#0a1628'; d.pointBorderWidth = 1.5;
          d.pointRadius = 5.5; d.pointHoverRadius = 8; d.pointHitRadius = 10;
          d.borderWidth = 2.6; d.borderDash = patterns[ri % patterns.length];
          d.wqKey = mark(d.pointStyle, d.borderColor, d.borderDash);
        });
        chart.options.plugins.legend.display = false;
        chart.options.animation = false;
        chart.options.interaction = {mode:'nearest', intersect:false};
        chart.options.plugins.tooltip = {...chart.options.plugins.tooltip, usePointStyle:true, titleFont:{size:14},bodyFont:{size:14},padding:12};
        for (const scale of Object.values(chart.options.scales || {})) {
          scale.ticks = {...scale.ticks,color:'#FFFFFF',font:{size:13},maxRotation:0};
          scale.title = {...scale.title,color:'#ffffff',font:{size:14,weight:'600'}};
          scale.grid = {...scale.grid,color:'rgba(180,205,230,.16)'};
        }
        chart.$wqMulti = multi;
      },
      afterInit(chart) {
        const wrap = chart.canvas.parentElement;
        wrap.classList.add('wq-readable-canvas');
        const card = wrap.parentElement;
        card.classList.add('wq-readable-card');
        card.querySelectorAll(':scope > .chart-legend').forEach(n=>n.remove());
        const region = document.createElement('div');region.className='wq-curve-controls';
        const title=card.querySelector('.chart-title,h3')?.textContent || 'Performance';
        chart.canvas.setAttribute('role','img');
        chart.canvas.setAttribute('aria-label',title+'. '+chart.data.datasets.map(d=>d.label).join('; ')+'. Exact values are available in the table below.');
        const note=document.createElement('p');note.className='wq-graph-guide';
        note.textContent=(chart.$wqMulti ? 'Shape + colour = displacement. Line pattern = speed.' : 'Each speed has its own shape, colour and line pattern.')+' Select a key to show or hide its curve.';
        region.append(note);
        const legend=document.createElement('div');legend.className='wq-curve-legend';legend.setAttribute('aria-label',title+' curve visibility');
        chart.data.datasets.forEach((d,i)=>{
          const b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed','true');
          b.innerHTML=d.wqKey+'<span>'+escape(d.label.replace(/cc\s*/,' cm³/rev · ').replace(/(\d)rpm/,'$1 rpm'))+'</span>';
          b.addEventListener('click',()=>{const show=!chart.isDatasetVisible(i);chart.setDatasetVisibility(i,show);b.setAttribute('aria-pressed',String(show));chart.update();});legend.append(b);
        });region.append(legend);
        const reset=document.createElement('button');reset.type='button';reset.className='wq-graph-reset';reset.textContent='Show all curves';reset.addEventListener('click',()=>{chart.data.datasets.forEach((_,i)=>chart.setDatasetVisibility(i,true));legend.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','true'));chart.update();});region.append(reset);
        const detail=document.createElement('details');detail.className='wq-graph-data';
        const y=chart.options.scales.y?.title?.text||'Value', x=chart.options.scales.x?.title?.text||'Pressure (bar)';
        detail.innerHTML='<summary>View plotted values</summary><div class="wq-graph-table-scroll" tabindex="0" aria-label="Plotted values"><table><caption>'+escape(title)+' — '+escape(y)+'</caption><thead><tr><th scope="col">'+escape(x)+'</th>'+chart.data.datasets.map(d=>'<th scope="col">'+escape(d.label)+'</th>').join('')+'</tr></thead><tbody>'+chart.data.labels.map((v,i)=>'<tr><th scope="row">'+escape(v)+'</th>'+chart.data.datasets.map(d=>'<td>'+escape(d.data[i]??'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
        region.append(detail);wrap.after(region);
      }
    });
  }
  install();
  document.addEventListener('DOMContentLoaded',()=>{
    // Give original source graphs a readable inspection view without resampling their data.
    document.querySelectorAll('[data-wq-source-graph]').forEach(img=>{
      const card=img.closest('figure,article') || img.parentElement;
      card.classList.add('wq-source-graph-card');
      const link=document.createElement('a');link.className='wq-graph-open';link.href=img.src;link.target='_blank';link.rel='noopener';link.textContent='Open readable full-size graph ↗';
      if(!card.querySelector('.wq-graph-open'))card.append(link);
    });
  });
})();
