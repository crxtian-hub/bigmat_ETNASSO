function useImagePreview(imagePath, imageFile) {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (imageFile) {
      const previewUrl = URL.createObjectURL(imageFile);
      setPreview(previewUrl);

      return () => URL.revokeObjectURL(previewUrl);
    }

    if (imagePath) {
      setPreview(assetUrl(imagePath));
      return undefined;
    }

    setPreview('');
    return undefined;
  }, [imagePath, imageFile]);

  return preview;
}

function useLayoutGridPreference(storageKey) {
  const [visible, setVisible] = useState(() => window.localStorage.getItem(storageKey) !== 'false');

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(visible));
  }, [storageKey, visible]);

  return [visible, setVisible];
}
