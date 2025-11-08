export default function FileUpload({ onFile, accept="application/pdf" }){
  return (
    <input
      type="file"
      accept={accept}
      onChange={(e) => onFile?.(e.target.files?.[0] || null)}
      className="input"
    />
  );
}
