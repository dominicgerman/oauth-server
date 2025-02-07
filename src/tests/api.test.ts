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

    it('should return 400 if client_id is missing', async () => {
        const response = await request(app)
            .get('/api/oauth/authorize')
            .query({
                response_type: 'code',
                redirect_uri: 'http://localhost:8081/process',
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'invalid_client');
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

    it('should return 400 for missing parameters', async () => {
        const response = await request(app)
            .post('/api/oauth/token')
            .send(`grant_type=authorization_code&client_id=upfirst`)
            .set('Content-Type', 'application/x-www-form-urlencoded');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'invalid_client');
    });

    it('should return 400 for an invalid authorization code', async () => {
        const response = await request(app)
            .post('/api/oauth/token')
            .send(
                `grant_type=authorization_code&code=abcdefg&client_id=upfirst&redirect_uri=http://localhost:8081/process`
            )
            .set('Content-Type', 'application/x-www-form-urlencoded');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'invalid_grant');
    });

    it('should return 400 for an unsupported grant_type', async () => {
        const response = await request(app)
            .post('/api/oauth/token')
            .send(
                `grant_type=client_credentials&client_id=upfirst&redirect_uri=http://localhost:8081/process`
            )
            .set('Content-Type', 'application/x-www-form-urlencoded');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'unsupported_grant_type');
    });
});
