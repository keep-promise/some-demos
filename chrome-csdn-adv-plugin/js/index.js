removeAD();
function removeAD() {
  let adSelectors = ['.adsbygoogle'];
  document.querySelectorAll(adSelectors.join(',')).forEach(item => {
    item.style.display = 'none';
  });
}
