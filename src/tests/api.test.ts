import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server';

describe('OAuth 2.0 API Tests', () => {
    it('should return 302 and redirect with a code', async () => {
        const response = await request(app)
            .get('/api/oauth/authorize')
            .query({
                response_type: 'code',
                client_id: 'upfirst',
                redirect_uri: 'http://localhost:8081/process',
                state: 'xyz123',
            });

        expect(response.status).toBe(302);
        expect(response.headers.location).toMatch(
            /http:\/\/localhost:8081\/process\?code=.*&state=xyz123/
        );
    });

    it('should exchange authorization code for access token', async () => {
        const authResponse = await request(app)
            .get('/api/oauth/authorize')
            .query({
                response_type: 'code',
                client_id: 'upfirst',
                redirect_uri: 'http://localhost:8081/process',
            });

        const code = new URL(authResponse.headers.location).searchParams.get('code');

        const tokenResponse = await request(app)
            .post('/api/oauth/token')
            .send(
                `grant_type=authorization_code&code=${code}&client_id=upfirst&redirect_uri=http://localhost:8081/process`
            )
            .set('Content-Type', 'application/x-www-form-urlencoded');

        expect(tokenResponse.status).toBe(200);
        expect(tokenResponse.body).toHaveProperty('access_token');
        expect(tokenResponse.body).toHaveProperty('token_type', 'bearer');
        expect(tokenResponse.body).toHaveProperty('expires_in');
    });
});
