@echo off
echo ==================================================
echo       APEX DRIVE - ONE-CLICK DEPLOY SCRIPT
echo ==================================================
echo.
echo 1. Staging changes...
git add .
echo.
echo 2. Committing changes...
git commit -m "Auto-update: %DATE% %TIME%"
echo.
echo 3. Pushing to GitHub...
git push origin main
echo.
echo ==================================================
echo Deployment triggered! Vercel is now building your live site.
echo You can close this window now.
echo ==================================================
pause
