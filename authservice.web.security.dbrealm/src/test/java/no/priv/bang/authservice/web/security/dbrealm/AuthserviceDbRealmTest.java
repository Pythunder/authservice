package no.priv.bang.authservice.web.security.dbrealm;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.sql.SQLException;
import java.util.Properties;

import javax.sql.DataSource;

import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.ops4j.pax.jdbc.derby.impl.DerbyDataSourceFactory;
import org.osgi.service.jdbc.DataSourceFactory;

import no.priv.bang.authservice.db.liquibase.test.TestLiquibaseRunner;
import no.priv.bang.osgi.service.mocks.logservice.MockLogService;

/***
 * Tests for class {@link AuthserviceDbRealm}.
 */
public class AuthserviceDbRealmTest {
    private static DataSource datasource;

    @BeforeAll
    static void setupForAll() throws Exception {
        DerbyDataSourceFactory derbyDataSourceFactory = new DerbyDataSourceFactory();
        Properties properties = new Properties();
        properties.setProperty(DataSourceFactory.JDBC_URL, "jdbc:derby:memory:authservice;create=true");
        datasource = derbyDataSourceFactory.createDataSource(properties);
        MockLogService logservice = new MockLogService();
        TestLiquibaseRunner runner = new TestLiquibaseRunner();
        runner.setLogservice(logservice);
        runner.activate();
        runner.prepare(datasource);
    }

    /***
     * Test a successful authentication.
     * @throws SQLException
     */
    @Test
    public void testGetAuthenticationInfo() throws SQLException {
        MockLogService logservice = new MockLogService();
        AuthserviceDbRealm realm = new AuthserviceDbRealm();
        realm.setLogservice(logservice);
        realm.setDataSource(datasource);
        realm.activate();
        AuthenticationToken token = new UsernamePasswordToken("jad", "1ad".toCharArray());
        AuthenticationInfo authInfo = realm.getAuthenticationInfo(token);
        assertEquals(1, authInfo.getPrincipals().asList().size());
    }

    /***
     * Test authentication failing because of a wrong password.
     * @throws SQLException
     */
    @Test
    public void testGetAuthenticationInfoWrongPassword() throws SQLException {
        MockLogService logservice = new MockLogService();
        AuthserviceDbRealm realm = new AuthserviceDbRealm();
        realm.setLogservice(logservice);
        realm.setDataSource(datasource);
        realm.activate();
        AuthenticationToken token = new UsernamePasswordToken("jad", "1add".toCharArray());

        assertThrows(IncorrectCredentialsException.class, () -> {
                AuthenticationInfo authInfo = realm.getAuthenticationInfo(token);
                assertEquals(1, authInfo.getPrincipals().asList().size());
            });
    }

    /***
     * Test authentication failing because of a wrong username, i.e. user
     * not found.
     * @throws SQLException
     */
    @Test
    public void testGetAuthenticationInfoWrongUsername() throws SQLException {
        MockLogService logservice = new MockLogService();
        AuthserviceDbRealm realm = new AuthserviceDbRealm();
        realm.setLogservice(logservice);
        realm.setDataSource(datasource);
        realm.activate();
        AuthenticationToken token = new UsernamePasswordToken("jadd", "1ad".toCharArray());

        assertThrows(UnknownAccountException.class, () -> {
                AuthenticationInfo authInfo = realm.getAuthenticationInfo(token);
                assertEquals(1, authInfo.getPrincipals().asList().size());
            });
        assertEquals(0, logservice.getLogmessages().size());
    }

    /***
     * Test authentication failing because the token is not a {@link UsernamePasswordToken}.
     */
    @Test
    public void testGetAuthenticationInfoWrongTokenType() {
        AuthserviceDbRealm realm = new AuthserviceDbRealm();
        AuthenticationToken token = mock(AuthenticationToken.class);
        String username = "jad";
        String password = "1ad";
        when(token.getPrincipal()).thenReturn(username);
        when(token.getCredentials()).thenReturn(password);

        assertThrows(ClassCastException.class, () -> {
                AuthenticationInfo authInfo = realm.getAuthenticationInfo(token);
                assertEquals(1, authInfo.getPrincipals().asList().size());
            });
    }

    /***
     * Test that a user gets the correct roles.
     * @throws SQLException
     */
    @Test
    public void testGetRolesForUsers() throws SQLException {
        MockLogService logservice = new MockLogService();
        AuthserviceDbRealm realm = new AuthserviceDbRealm();
        realm.setLogservice(logservice);
        realm.setDataSource(datasource);
        realm.activate();
        AuthenticationToken token = new UsernamePasswordToken("jad", "1ad".toCharArray());
        AuthenticationInfo authenticationInfoForUser = realm.getAuthenticationInfo(token);

        boolean jadHasRoleUser = realm.hasRole(authenticationInfoForUser.getPrincipals(), "caseworker");
        assertTrue(jadHasRoleUser);

        boolean jadHasRoleAdministrator = realm.hasRole(authenticationInfoForUser.getPrincipals(), "administrator");
        assertFalse(jadHasRoleAdministrator);
    }

    /***
     * Test that an administrator gets the correct roles.
     * @throws SQLException
     */
    @Test
    public void testGetRolesForAdministrators() throws SQLException {
        MockLogService logservice = new MockLogService();
        AuthserviceDbRealm realm = new AuthserviceDbRealm();
        realm.setLogservice(logservice);
        realm.setDataSource(datasource);
        realm.activate();
        AuthenticationToken token = new UsernamePasswordToken("on", "ola12".toCharArray());
        AuthenticationInfo authenticationInfoForUser = realm.getAuthenticationInfo(token);

        boolean onHasRoleUser = realm.hasRole(authenticationInfoForUser.getPrincipals(), "caseworker");
        assertTrue(onHasRoleUser);

        boolean onHasRoleAdministrator = realm.hasRole(authenticationInfoForUser.getPrincipals(), "admin");
        assertTrue(onHasRoleAdministrator);
    }

}
