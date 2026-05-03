import { test, expect } from '@playwright/test';

test.describe('API Testing Example', () => {
    const baseURL = 'https://jsonplaceholder.typicode.com';

    test('GET /users - should return a list of users', async ({ request }) => {
        const response = await request.get(`${baseURL}/users`);

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);

        const users = await response.json();
        expect(users.length).toBeGreaterThan(0);
        expect(users[0]).toHaveProperty('id');
        expect(users[0]).toHaveProperty('name');
    });

    test('POST /posts - should create a new post', async ({ request }) => {
        const response = await request.post(`${baseURL}/posts`, {
            data: {
                title: 'Playwright API Test',
                body: 'Testing API with Playwright request context',
                userId: 1,
            }
        });

        expect(response.status()).toBe(201);
        const post = await response.json();
        expect(post.title).toBe('Playwright API Test');
    });
});
