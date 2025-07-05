import fs from 'node:fs';
import path from 'node:path';
import { noop } from '@/lib/core/noop';

export const defaultIgnore = `
###############################################################################
#  🌍  GLOBAL OPERATING‑SYSTEM FILES
###############################################################################
# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon?
._*
.Spotlight‑V100
.Trashes
*.swp
*.swo

# Windows
Thumbs.db
ehthumbs.db
ehthumbs_vista.db
Desktop.ini
$Recycle.Bin/
*.lnk

# Linux
*~
.cache
.trash
.nfs*

###############################################################################
#  💻  COMMON VCS / BACKUP / PACKAGE MANAGER JUNK
###############################################################################
*.log
*.pid
*.seed
*.audit
*.cover
*.orig
*.rej
*.sublime‑workspace
*.sublime‑project
*.tmp
*‑backup*
*.bak
*.old
*.swp
*.swo
*.swn

# lock & integrity files (remove if you want them versioned)
package-lock.json
pnpm-lock.yaml
npm‑shrinkwrap.json
yarn.lock
.pnpm‑metadata
.turbo/

###############################################################################
#  📦  DEPENDENCY FOLDERS
###############################################################################
node_modules/
bower_components/
.venv/
env/
venv/
.venv.bak/
vendor/
Pods/
Carthage/
.ReSharper*/              # Rider / ReSharper caches

###############################################################################
#  🛠  BUILD / DIST / CACHE OUTPUT
###############################################################################
dist/
build/
out/
public/
coverage/
target/
bin/
obj/
*.dSYM/
*.class
*.egg-info/
*.gem
*.war
*.ear
*.iml
.cache/
.cache-loader/
.next/
.nuxt/
.gradle/
.idea/
.vscode/
.sass-cache/
parcel-cache/
.pnp
.pnp.js
.mypy_cache/
__pycache__/
.pytest_cache/
.hypothesis/
.cache-test/
.cache‑eslint/
.lerna‑cache/
.nyc_output/
.svelte-kit/
.scala‑build/
.cargo/
.rustup/
.r10k/
pkg/
ionic‑www/
platforms/

###############################################################################
#  🧰  LANGUAGE‑SPECIFIC
###############################################################################
# TypeScript
*.tsbuildinfo
tsconfig.tsbuildinfo

# Java / Kotlin
*.jar
*.war
*.ear

# Go
*.test
*.exe
*.exe~
*.dll
*.so
*.dylib
*.a

# Rust
/target/
Cargo.lock            # comment out if you commit lockfile

# Python
*.py[cod]
*.pyo
*.pyd
*.pyc
*.pdb
*.pyu
*.pyz
*.pywz

# PHP
/vendor/
/composer.phar

# Ruby
*.gem
.bundle/
.Gemfile.lock         # comment out if you need deterministic gems

# Swift / Xcode
*.xcodeproj/*
!.xcodeproj/project.pbxproj
*.xcworkspace/
DerivedData/
build/
*.moved-aside
*.ipa
*.dSYM.zip

# Android / Gradle
*.apk
*.aar
*.ap_
/.gradle/
/local.properties
/.idea/caches
.cxx/

# .NET
*.dll
*.exe
*.pdb
*.mdb
*.ilk
*.obj
*.rbc
*.res
*.tlh
*.tli
*.cache/
*.log
*.vs/
_ReSharper*/
*.ncrunch*
*.user
*.suo
*.userosscache
*.sln.docstates

# C / C++
*.o
*.a
*.so
*.dylib
*.obj
*.lib
*.dll
*.exe
*.exp
*.pdb
*.idb

###############################################################################
#  🖍  GRAPHICS / MEDIA / DESIGN
###############################################################################
*.psd
*.ai
*.eps
*.svgz
*.xcf
*.swf
*.fla
*.flv
*.sketch
*.fig
*.raw
*.ttf
*.otf

###############################################################################
#  📃  DOCUMENTATION & OFFICE
###############################################################################
*.doc
*.docx
*.xls
*.xlsx
*.ppt
*.pptx
*.pdf
*.pages
*.numbers
*.key
*.out.pdf

###############################################################################
#  🔒  SENSITIVE / PERSONAL
###############################################################################
*.env
.env.*
*.pem
*.key
*.crt
*.pfx
secrets.*
private.key
id_rsa
id_rsa.pub
.keystore
*.kdb
*.kdbx
.npmrc
.yarnrc
.psqlrc
.sqliterc
.my.cnf
appsettings*.json
firebase‑service‑account*.json

###############################################################################
#  🧪  TEST & TEMP
###############################################################################
*.mocha*
/tmp/
/temp/
tests/output/
tmp/
__snapshots__/
*.spec.js.snap

###############################################################################
#  🚀  DEPLOY / CI
###############################################################################
docker‑compose.override.yml
docker‑compose.*.yml
*.tfstate
*.tfstate.*

###############################################################################
#  📨  MAIL / MUA
###############################################################################
*.eml
*.msg
*.mbox
Maildir/

###############################################################################
#  🎨  FONTS & CACHE
###############################################################################
*.woff
*.woff2
*.eot
.fonts/
._fontcache
font‑cache‑*

###############################################################################
#  🗑  END OF FILE
###############################################################################
#  Feel free to delete any section you don’t need.
`;

/* ------------------------------------------------------------------ */
/* ⚡️  baseline ignore rules are loaded synchronously *once*           */
/* ------------------------------------------------------------------ */
export function loadBasePatterns(rootDir: string): string[] {
  const patterns: string[] = [];
  try {
    patterns.push(...defaultIgnore.split(/\r?\n/));
  } catch (e) {
    noop(e);
  }
  try {
    patterns.push(
      ...fs
        .readFileSync(path.join(rootDir, '.gitignore'), 'utf8')
        .split(/\r?\n/)
    );
  } catch {
    /* no project-level .gitignore */
  }
  return patterns;
}
