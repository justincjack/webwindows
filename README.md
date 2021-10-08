# webwindows
JavaScript desktop window management system.

A desktop window manager for windowed web applications.

As of this writing, this system/API was designed for and tested with Google Chrome >= Version 93.  Other developers are encouraged to help make this system more cross-browser compatible!

Significant documentation will be coming soon.

(Very) Quick Start:
```
<!DOCTYPE html>
<html>
    <head>
        <script src='windows.js'></script>
    </head>
    <body onload='start()'>

        <script>
            var win1, win2, win3, win4, win5;
            var title_array = [];

            function start() {
                win = new WINDOW("0", "0", "50%", "50%", "Window 1");
                win.show();
                
                // Set the window's icon.  For the best results, it should be 32x32 or 64x64.
                // win.icon = "https://some_icon.png";

                win2 = new WINDOW("50%", "0", "50%", "50%", "Window 2");
                win2.show();
                
                win2.contents = "<span class='myclass'>An HTML string</span>";
                
                let myspan = win2.get_single_element("span", "myclass");
                
                myspan.style.textDecoration = "underline";

                win3 = new WINDOW("0", "50%", "50%", "50%", "Window 3");
                win3.show();

                win4 = new WINDOW("50%", "50%", "50%", "50%", "Window 4");
                win4.show();

                win5 = new WINDOW(null, null, "50%", "50%", "Center Window");
                win5.show();

                setTimeout(()=>{
                    win5.show_busy = true;
                    for (i = 5; i >= 1; i--) {
                        title_array.push("Loading " + i.toString() + "/5");
                        setTimeout(()=>{
                            win5.title = title_array.pop();
                            if (title_array.length === 0) {
                                win5.show_busy = false;
                                win5.title = "Everything has loaded!";
                            }
                        }, i*1000);
                    }
                }, 1000);
            }


        </script>
    </body>
</html>
```


- Double click a minimized/docked window to restore it.
- Drag a docked window to "unmanage" it.  That means it will minimize/restore where it is dropped.

