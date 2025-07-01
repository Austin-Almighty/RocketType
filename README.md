## Welcome to Your Next Galactic Adventure!


**Rocket Type** is a minimalistic typing app designed to help you improve your speed and accuracy while having fun! Compete for the top spot, track your progress, and blast off your typing skills to new heights.
![alt text](homepage.gif)

## Give it a try here!
**[Live Demo](https://celestial-scribes.vercel.app)**

## 🚩 Features

- Multiple typing modes: Timed, Word Count, and free mode
- Clean, distraction-free interface
- Real-time stats: WPM, accuracy, errors, raw speed
- Leaderboards & personal progress tracking
- Color Themes Support (35 themes)
- Animated visual feedback and fun graphics


## ⌨ User Guide
- Select your settings and get ready to type! <br>
![alt text](<Screenshot 2025-06-20 at 22.29.58.png>)
- Track your scores with detailed stats!
![alt text](<Screenshot 2025-07-01 at 13.41.46.png>)
- See how you stack up against other players on the leaderboard
![alt text](image-2.png)
- Want a different look? Choose from 35 color themes and find one that suit your fancy!
![alt text](image-3.png)

## 🖥️ Tech Stack

#### Front-end
- React
    - Custom Hooks
- Next.js
- Tailwind
- Motion


#### Back-end and Database
- Vercel
- Firestore


#### UI/UX
- DaisyUI
- shadcn/ui
- Recharts
- React-icons


![alt text](image.png)

## Development Details

- The test settings, current test results, and login state are managed by a custom hook. Certain settings are only visible in certain game modes. 
- Once a test is completed, the result in the custom hook will be sent to the Firestore database via an async function.

![alt text](image-4.png)

![alt text](result.gif)

## "Controlled" Auto Scrolling
To keep the caret (the current input position) always in the middle of the viewport—the second line in a three-line layout—I used a combination of the useEffect and useRef hooks to achieve the desired effect.


``` JavaScript
 useEffect(() => {
      if (!containerRef.current || !currentCharRef.current) return;

      //useRef hooks to track the position of the caret and its parent container
      const container = containerRef.current; 
      const currentChar = currentCharRef.current;

      const lineHeight = 60;
      // the distance between the current position and the top of the container
      const caretLine = Math.round(currentChar.offsetTop / lineHeight);
    
      if (caretLine < 2) {
        // if the caret is on the first or second line, no scrolling is required.
        container.scrollTop = 0;
      } else {
        // When the caret enters the third line, the scrollTop method will be triggered. Therefore, always keeping three lines of text visible.
        container.scrollTop = (caretLine - 1) * lineHeight;
      }
    }, [userInput]);
```

## 📧 Contact
- My name is Austin Liao (廖祥廷). I am a front-end developer based in Taiwan. You can reach me via one of the methods below. Come and say hi!
- [E-mail](austin.ht.liao@gmail.com)
- [LinkedIn](https://www.linkedin.com/in/hsiang-ting-liao/)
