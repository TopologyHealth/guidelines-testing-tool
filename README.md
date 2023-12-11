# **Installation and Setup**
This guide will walk you through the process of installing and setting up the Medical Guidelines Repository application on your local machine. We'll be using Next.js for the frontend and FastAPI for the backend.
# **Frontend Setup**
1. Clone the FrontEnd 
2. Navigate into the cloned repository: `cd juniper-frontend`
3. Install all the necessary dependencies with: `npm install --legacy-peer-deps`
4. Start the development server with: `npm run dev`

The frontend of the application should now be accessible at <http://localhost:3000>.
# **Backend Setup**
1. Navigate into the cloned repository: `cd juniper-api`
2. Install all the necessary Python dependencies by running: `pip install -r requirements.txt`
3. Start the development server with: `uvicorn main:app --reload`

The backend of the application should now be accessible at <http://localhost:8000> and the API endpoints can be tested through [http://localhost:8000/docs#](http://localhost:8000/docs).
# **AWS S3 Bucket Configuration**
1. Obtain your AWS Credentials. 
2. Configure your AWS CLI with the provided credentials. 

**AWS CLI Configuration:** 

To use the AWS CLI (Command Line Interface), you first need to install it on your machine and then configure it with your AWS credentials.

After installing the AWS CLI, you can configure it to interact with your AWS account by using the  aws configure command: `aws configure`

This will prompt you to enter your Access Key ID, Secret Access Key, and default region. These values should be the ones provided to you:

```
AWS Access Key ID [None]: YOUR\_ACCESS\_KEY

AWS Secret Access Key [None]: YOUR\_SECRET\_KEY

Default region name [None]: YOUR\_DEFAULT\_REGION (e.g., us-west-2)

Default output format [None]: json (or text / table based on your preference)
```

This will create a profile that uses these credentials by default whenever you run an AWS CLI command. The credentials are stored in a local file located at `~/.aws/credentials` on Linux and macOS, or `C:\Users\USERNAME\.aws\credentials` on Windows. You can also add multiple sets of credentials to this file if you need to use different AWS accounts.

With the AWS CLI installed and configured, you can interact with your AWS services directly from your terminal or command prompt.
## **Medplum Account Setup**
Lastly, you need to have a Medplum account to use the application:

1- Create a new Medplum account, if you do not already have one.

2- Add your new account to the Medplum server used for this application.

**Medplum Clients:** 

Currently, two Medplum clients are used for Juniper:

1. **Juniper Client**: This client is utilized for the deployed code. It has a redirect URL that points to the deployed URL of the application.
1. **Juniper Local Client**: This client is primarily used for local development and testing. It has a redirect URL for the localhost URL where your local instance of the application runs.

The Client ID and Client Secret for these Medplum clients are essential for authenticating and authorizing access to the Medplum services. These credentials are securely stored in `.env` configuration files.
