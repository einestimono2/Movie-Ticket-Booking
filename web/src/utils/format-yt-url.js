export const getEmbedYoutubeURL = (url) => {
  // src={'https://www.youtube.com/embed/7KDRqBpT8NA'}
  // src={'https://www.youtube.com/embed/J7XVzwEdUNw'}
  let _url = url.split('&')?.at(0).replace('watch?v=', 'embed/');

  // _url += `?showinfo=1&controls=1&autohide=1&color=white&modestbranding=1&playsinline=1&rel=1&enablejsapi=1`;
  _url += `?rel=0`;

  return _url;
};
