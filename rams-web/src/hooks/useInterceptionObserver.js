import { useEffect, useState } from 'react';

const useInterceptionObserver = ({ elements, root }) => {
    const [current, setCurrent] = useState(elements[0].text);
    root = root ? { root: document.querySelector(`.${root}`) } : {}
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // let currentIntersectionRatio = 0;
                let currentText = '';
                entries.reverse().forEach((item) => {
                    const ratio = item.intersectionRatio;
                    if (ratio > 0.3) {
                        const currentId = item.target.className;
                        currentText = elements.find((item) => item.id === currentId)?.text;
                    }
                });
                if (currentText) {
                    setCurrent(currentText);
                }
            },
            {
                ...root,
                threshold: [0, 0.25, 0.5, 0.75, 1]
            },
        );

        elements.forEach((item) => {
            const element = document.querySelector(`.${item.id}`);

            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            observer.disconnect();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elements]);

    return current;
};

export default useInterceptionObserver;
