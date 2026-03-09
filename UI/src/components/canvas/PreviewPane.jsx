import PropTypes from 'prop-types';

const PreviewPane = function PreviewPane({ src, activeFilter }) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt="Live preview"
      className="block"
      style={{
        maxWidth: 'none',
        filter:   activeFilter.css,
      }}
    />
  );
};

PreviewPane.propTypes = {
  src: PropTypes.string,
  activeFilter: PropTypes.shape({
    id:    PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    css:   PropTypes.string.isRequired,
  }).isRequired,
};

PreviewPane.defaultProps = {
  src: '',
};

export default PreviewPane;
