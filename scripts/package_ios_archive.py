"""
RDF Flow - iOS Archive & IPA Packager
Bundles iOS Application Package.
"""

import os
import zipfile

def package_ios():
    output_dir = os.path.abspath("build/ios")
    os.makedirs(output_dir, exist_ok=True)
    zip_path = os.path.join(output_dir, "RDF-Flow-v0.1.0-ios.zip")
    
    print(f"[RDF Flow] Packaging iOS archive to: {zip_path}")
    
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as arc:
        # 1. Info.plist
        plist_content = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>RDF Flow</string>
    <key>CFBundleExecutable</key>
    <string>RDFFlow</string>
    <key>CFBundleIdentifier</key>
    <string>com.rdfflow.app</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>RDF Flow</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>0.1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>RDF Flow needs access to the microphone for real-time speech-to-text dictation.</string>
</dict>
</plist>"""
        arc.writestr("Payload/RDFFlow.app/Info.plist", plist_content)
        
        # 2. Add dist files
        dist_dir = os.path.abspath("dist")
        if os.path.exists(dist_dir):
            for root, _, files in os.walk(dist_dir):
                for f in files:
                    full_p = os.path.join(root, f)
                    rel_p = os.path.relpath(full_p, dist_dir)
                    arc.write(full_p, f"Payload/RDFFlow.app/public/{rel_p}")
                    
        # 3. Add icon
        icon_path = os.path.abspath("assets/icon-512.png")
        if os.path.exists(icon_path):
            arc.write(icon_path, "Payload/RDFFlow.app/AppIcon512x512.png")
            
        print(f"[RDF Flow] Successfully bundled iOS archive: {zip_path} ({os.path.getsize(zip_path)} bytes)")

if __name__ == "__main__":
    package_ios()
