import { getEmbedYoutubeURL } from '../../utils/format-yt-url';

export const Video = (props) => {
  return (
    <iframe
      style={{
        width: props.width ?? '100%',
        height: props.height ?? '60vh',
        borderRadius: props.borderRadius ?? '6px',
      }}
      src={getEmbedYoutubeURL(props.url)}
      title="Trailer"
      frameBorder="0"
      allow="accelerometer; autoplay; fullscreen; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
  );
};
