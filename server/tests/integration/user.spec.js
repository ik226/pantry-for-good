import Customer from '../../models/customer'
import Volunteer from '../../models/volunteer'
import Donor from '../../models/donor'
import app from '../../config/express'
import User from '../../models/user'

describe('User Api', function() {
  before(async function() {
    await initDb()
  })

  beforeEach(async function() {
    await Customer.find().remove()
    await Volunteer.find().remove()
    await Donor.find().remove()
    await User.find().remove()
  })

  after(async function() {
    await Customer.find().remove()
    await Volunteer.find().remove()
    await Donor.find().remove()
    await User.find().remove()
    await resetDb()
  })

  describe('signup', function() {
    it('signs up customers', async function() {
      const request = supertest.agent(app())
      const newUser = {
        firstName: 'Frank',
        lastName: 'Harper',
        email: 'fharper@example.com',
        password: '12345678',
        accountType: 'customer',
      }
      return await request.post('/api/auth/signup')
        .send(newUser)
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.an.object
          expect(res.body).to.have.property('_id')
          expect(res.body.firstName).to.equal('Frank')
          expect(res.body.lastName).to.equal('Harper')
          expect(res.body.email).to.equal('fharper@example.com')
          expect(res.body.accountType).to.eql(['customer'])
        })
    })

    it('signs up volunteers', async function() {
      const request = supertest.agent(app())
      const newUser = {
        firstName: 'Bill',
        lastName: 'Lyon',
        email: 'blyon@example.com',
        password: '12345678',
        accountType: 'volunteer',
      }
      return await request.post('/api/auth/signup')
        .send(newUser)
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.an.object
          expect(res.body).to.have.property('_id')
          expect(res.body.firstName).to.equal('Bill')
          expect(res.body.lastName).to.equal('Lyon')
          expect(res.body.email).to.equal('blyon@example.com')
          expect(res.body.accountType).to.eql(['volunteer'])
        })
    })

    it('signs up donors', async function() {
      const request = supertest.agent(app())
      const newUser = {
        firstName: 'Margaret',
        lastName: 'Willis',
        email: 'mwillis@example.com',
        password: '12345678',
        accountType: 'donor',
      }
      return await request.post('/api/auth/signup')
        .send(newUser)
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.an.object
          expect(res.body).to.have.property('_id')
          expect(res.body.firstName).to.equal('Margaret')
          expect(res.body.lastName).to.equal('Willis')
          expect(res.body.email).to.equal('mwillis@example.com')
          expect(res.body.accountType).to.eql(['donor'])
        })
    })

    it('it requires a first name', async function() {
      const request = supertest.agent(app())
      const newUser = {
        lastName: 'Willis',
        email: 'mwillis@example.com',
        password: '12345678',
        accountType: 'donor',
      }
      return await request.post('/api/auth/signup')
        .send(newUser)
        .expect(400)
        .expect(res => {
          expect(res.body.error.errors.firstName.message).to.equal('Please fill in your first name')
        })
    })

    it('it requires a last name', async function() {
      const request = supertest.agent(app())
      const newUser = {
        firstName: 'Willis',
        email: 'mwillis@example.com',
        password: '12345678',
        accountType: 'donor',
      }
      return await request.post('/api/auth/signup')
        .send(newUser)
        .expect(400)
        .expect(res => {
          expect(res.body.error.errors.lastName.message).to.equal('Please fill in your last name')
        })
    })

    it('requires a password', async function() {
      const request = supertest.agent(app())
      const newUser = {
        firstName: 'Margaret',
        lastName: 'Willis',
        email: 'mwillis@example.com',
        accountType: 'donor',
      }
      return await request.post('/api/auth/signup')
        .send(newUser)
        .expect(400)
        .expect(res => {
          expect(res.body.error.errors.password.message).to.equal('Password should be longer')
        })
    })

    it('requires a password to be at least 6 characters', async function() {
      const request = supertest.agent(app())
      const newUser = {
        firstName: 'Margaret',
        lastName: 'Willis',
        email: 'mwillis@example.com',
        password: '12345',
        accountType: 'donor',
      }
      return await request.post('/api/auth/signup')
        .send(newUser)
        .expect(400)
        .expect(res => {
          expect(res.body.error.errors.password.message).to.equal('Password should be longer')
        })
    })

    it('requires an account type', async function() {
      const request = supertest.agent(app())
      const newUser = {
        firstName: 'Frank',
        lastName: 'Harper',
        password: '12345678',
        email: 'mwillis@example.com'
      }
      return await request.post('/api/auth/signup')
        .send(newUser)
        .expect(400)
        .expect(res => {
          expect(res.body.error.errors.accountType.message).to.equal('Please select account type')
        })
    })

    it('does not allow signup if email address already has an account', async function() {
      const request = supertest.agent(app())
      const newUser = {
        firstName: 'Frank',
        lastName: 'Harper',
        email: 'fharper@example.com',
        password: '12345678',
        accountType: 'customer',
      }
      
      await request.post('/api/auth/signup')
        .send(newUser)

      const newUser2 = {
        firstName: 'Francine',
        lastName: 'Harper',
        email: 'fharper@example.com',
        password: '12345678',
        accountType: 'customer',
      }
      return await request.post('/api/auth/signup')
        .send(newUser2)
        .expect(400)
        .expect(res => {
          expect(res.body.error.errors.email.message).to.equal('Email address already has an account')
        })
    })
  })

  describe('loggin in', function() {
    it('signs in', async function() {
      const newUser = {
        firstName: 'Frank',
        lastName: 'Harper',
        email: 'fharper@example.com',
        password: '12345678',
        accountType: 'customer',
      }
      const request = supertest.agent(app())
      await request.post('/api/auth/signup')
        .send(newUser)

      return await request.post('/api/auth/signin')
        .send({email: 'fharper@example.com', password: '12345678'})
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.an.object
          expect(res.body).to.have.property('_id')
        })
    })

    it('fails without an email', async function() {
      const newUser = {
        firstName: 'Frank',
        lastName: 'Harper',
        email: 'fharper@example.com',
        password: '12345678',
        accountType: 'customer',
      }
      const request = supertest.agent(app())
      await request.post('/api/auth/signup')
        .send(newUser)

      return await request.post('/api/auth/signin')
        .send({password: '12345678'})
        .expect(400)
        .expect(res => {
          expect(res.body).to.be.an.object
          expect(res.body.message).to.equal('Missing credentials')
        })
    })

    it('fails without a password', async function() {
      const newUser = {
        firstName: 'Frank',
        lastName: 'Harper',
        email: 'fharper@example.com',
        password: '12345678',
        accountType: 'customer',
      }
      const request = supertest.agent(app())
      await request.post('/api/auth/signup')
        .send(newUser)

      return await request.post('/api/auth/signin')
        .send({email: 'fharper@example.com'})
        .expect(400)
        .expect(res => {
          expect(res.body).to.be.an.object
          expect(res.body.message).to.equal('Missing credentials')
        })
    })

    it('fails with the wrong password', async function() {
      const newUser = {
        firstName: 'Frank',
        lastName: 'Harper',
        email: 'fharper@example.com',
        password: '12345678',
        accountType: 'customer',
      }
      const request = supertest.agent(app())
      await request.post('/api/auth/signup')
        .send(newUser)

      return await request.post('/api/auth/signin')
        .send({email: 'fharper@example.com', password: 'xxxxxxxxx'})
        .expect(400)
        .expect(res => {
          expect(res.body).to.be.an.object
          expect(res.body.message).to.equal('Unknown user or invalid password')
        })
    })
  })  
})
