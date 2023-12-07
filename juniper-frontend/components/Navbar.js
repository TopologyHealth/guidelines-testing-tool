import { AppBar, Toolbar, Typography } from '@material-ui/core';
import Link from 'next/link';

export default function Navbar(props) {
    return (
        <AppBar position="static" style={{ backgroundColor: '#4D6D9A', color: 'white' }}>
        <Toolbar style={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">
                <Link href="/" as="/">
                  Guideline Repository
                </Link>
          </Typography>
          <div style={{ display: 'flex', gap: '20px' }}>
              <Typography variant='h6'>
                Logged in as {props.user ? props.user["given_name"] : ""}
              </Typography>
              <Typography variant="h6">
                <Link href="/logout" as="/logout">
                  Sign out
                </Link>
              </Typography>
            
          </div>
        </Toolbar>
      </AppBar>
    );
  }