/*
 * Copyright 2019 Steinar Bang
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations
 * under the License.
 */
package no.priv.bang.authservice.web.security.resources;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.osgi.service.log.LogService;

import no.priv.bang.authservice.definitions.AuthserviceException;
import no.priv.bang.authservice.web.security.ShiroTestBase;
import no.priv.bang.osgi.service.mocks.logservice.MockLogService;
import no.priv.bang.osgiservice.users.User;
import no.priv.bang.osgiservice.users.UserManagementService;

class LoggedInUserResourceTest extends ShiroTestBase {

    @Test
    void testFindLoggedInUser() {
        LogService logservice = null;
        UserManagementService useradmin = mock(UserManagementService.class);
        String username = "jad";
        User user = new User(1, username, "jane@gmail.com", "Jane", "Doe");
        when(useradmin.getUsers()).thenReturn(Arrays.asList(user));

        loginUser(username, "1ad");

        Optional<User> loggedInUser = LoggedInUserResource.findLoggedInUser(logservice, useradmin);
        assertTrue(loggedInUser.isPresent());
    }

    @Test
    void testFindLoggedInUserWhenUserIsNotLoggedIn() {
        LogService logservice = null;
        UserManagementService useradmin = mock(UserManagementService.class);

        createSubjectWithNullPrincipalAndBindItToThread();

        Optional<User> loggedInUser = LoggedInUserResource.findLoggedInUser(logservice, useradmin);
        assertFalse(loggedInUser.isPresent());
    }

    @Test
    void testFindLoggedInUserWhenShiroNotInitialized() {
        MockLogService logservice = new MockLogService();
        UserManagementService useradmin = mock(UserManagementService.class);

        createNullWebSubjectAndBindItToThread();

        assertThrows(AuthserviceException.class, () -> {
                Optional<User> loggedInUser = LoggedInUserResource.findLoggedInUser(logservice, useradmin);
                assertFalse(loggedInUser.isPresent());
            });
    }

}
