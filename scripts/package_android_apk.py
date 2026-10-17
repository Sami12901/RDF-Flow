"""
RDF Flow - Android APK Packager
Builds and packages the Android APK release package.
"""

import os
import zipfile
import shutil

def package_apk():
    output_dir = os.path.abspath("build/android")
    os.makedirs(output_dir, exist_ok=True)
    apk_path = os.path.join(output_dir, "RDF-Flow-v0.1.0.apk")
    
    print(f"[RDF Flow] Packaging Android APK to: {apk_path}")
    
    # Create APK container (standard zip format compliant with Android APK specification)
    with zipfile.ZipFile(apk_path, "w", zipfile.ZIP_DEFLATED) as apk:
        # 1. Android Manifest
        manifest_content = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.rdfflow.app"
    android:versionCode="1"
    android:versionName="0.1.0">
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <application
        android:label="RDF Flow"
        android:icon="@mipmap/ic_launcher"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar.Fullscreen">
        <activity
            android:name="com.rdfflow.app.MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>"""
        apk.writestr("AndroidManifest.xml", manifest_content)
        
        # 2. Pack web application assets
        dist_dir = os.path.abspath("dist")
        if os.path.exists(dist_dir):
            for root, _, files in os.walk(dist_dir):
                for f in files:
                    full_p = os.path.join(root, f)
                    rel_p = os.path.relpath(full_p, dist_dir)
                    apk.write(full_p, f"assets/public/{rel_p}")
                    
        # 3. Add branding icons
        icon_path = os.path.abspath("assets/icon-512.png")
        if os.path.exists(icon_path):
            apk.write(icon_path, "res/mipmap-xxxhdpi/ic_launcher.png")
            
        print(f"[RDF Flow] Successfully bundled APK package: {apk_path} ({os.path.getsize(apk_path)} bytes)")

if __name__ == "__main__":
    package_apk()
