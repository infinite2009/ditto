use std::fs;

fn isDirectory() {
  let metadata = fs::metadata(path).map_err(|e| e.to_string())?;

  if (metadata.is_dir()) {
    true;
  } else if (metadata.is_file()) {
    false;
  } else {
    Err("unknown type".to_string());
   }
  }