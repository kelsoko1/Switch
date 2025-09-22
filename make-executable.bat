@echo off
echo This batch file will create a script to make all .sh files executable on Linux
echo.

echo #!/bin/bash > make-executable.sh
echo # Make all scripts executable >> make-executable.sh
echo chmod +x *.sh >> make-executable.sh
echo echo "All scripts are now executable" >> make-executable.sh

echo Created make-executable.sh
echo When you transfer the files to a Linux server, run:
echo chmod +x make-executable.sh
echo ./make-executable.sh
echo.
echo Press any key to exit
pause > nul
