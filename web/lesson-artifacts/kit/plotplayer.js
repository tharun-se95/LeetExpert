/* kit/plotplayer.js: the stepped cost plot, PlotView (plots.js) run by the step player (player.js). Kept apart
   from plots.js so a page that draws only the static costChart does not ship the player's chrome. Spec:
   docs/superpowers/specs/2026-09-30-cost-plot-player-design.md. */

/* each walkthrough may state claims of its own (plotWalk's o.inv), so the list follows the snapshot shown */
function PlotPlayer(host,o){
  o=o||{};var view=PlotView(o),all=function(s){return PL_INV.concat(o.inv||[],s.plot.inv||[]);};
  view.inv=function(s){return all(s).map(function(x){return [x[0],x[1]];});};view.check=function(s){return all(s).map(function(x){return !!x[2](s);});};
  var p=new StepPlayer(host,o,view);
  if('ResizeObserver' in window)new ResizeObserver(function(){p.redraw();}).observe(host);
  return p;
}
function mountPlotTabs(w,examples,o){return mountPlayerTabs(w,examples,function(h,x){return new PlotPlayer(h,x);},o);}
