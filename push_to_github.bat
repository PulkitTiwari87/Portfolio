@echo off
echo Initializing Git...
git init
git remote add origin https://github.com/PulkitTiwari87/Portfolio_ver3.git
git remote set-url origin https://github.com/PulkitTiwari87/Portfolio_ver3.git
echo Adding files...
git add .
echo Committing changes...
git commit -m "Complete portfolio personalization: Dynamic GitHub projects, modern Experience & Contact sections"
echo Pushing to GitHub...
git branch -M main
git push -u origin main
echo Done!
pause
