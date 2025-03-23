require('@testing-library/jest-dom');

beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
    });

    // Mock confetti
    global.confetti = jest.fn();
});
