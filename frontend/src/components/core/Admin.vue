<template>
  <div>
    <div id="admin" v-if="User && User.access && User.access.admin" v-bind="User">
      <!-- FRAME TOGGLES -->
      <md-button-toggle class="md-accent" md-single>
        <md-button v-if="User.access.admin.super || User.access.admin.config?.embed" :class="{'md-toggle': showPanel === 'sitecfg'}" @click="toggleFrame('sitecfg')">Site Config</md-button>
        <md-button v-if="User.access.admin.blog || User.access.admin.super" :class="{'md-toggle': showPanel === 'blogpost'}" @click="toggleFrame('blogpost')">Blog Posts</md-button>
        <md-button v-if="User.access.admin.super || User.access.admin.moderator" :class="{'md-toggle': showPanel === 'users'}" @click="toggleFrame('users')">User Control</md-button>
        <md-button v-if="User.access.admin.super" :class="{'md-toggle': showPanel === 'status'}" @click="toggleFrame('status')">Status</md-button>
      </md-button-toggle>

      <!-- BLOG FRAME -->
      <md-layout id="admin-blog-container" v-if="(User.access.admin.super || User.access.admin.blog) && showPanel=='blogpost'">
        <md-layout class="md-left" ref="blogSidebar" id="blog-sidebar" md-flex="15">
          <md-list class="md-double-line">
            <md-list-item @click="LoadBlog(-1)" v-bind:class="{selected: (blogSelected === -1)}">
              <div class="md-list-text-container">
                <span>New post</span>
              </div>
            </md-list-item>
            <md-list-item v-if="blogs.length > 0" v-for="(blog, index) in blogs" :key="index" @click="LoadBlog(index)" v-bind:class="{selected: (blogSelected === index)}">
              <div class="md-list-text-container">
                <span>{{ blog.title }}  <em v-if="blog.publishStatus === 'draft'">Draft</em></span>
                <span v-if="blog._userId">{{ blog._userId.account.username }}</span>
                <span>{{ blog.date | moment('MMM Do YYYY LT') }}</span>
              </div>
            </md-list-item>
          </md-list>
        </md-layout>
        <md-layout md-flex="85">
          <md-card>
            <md-input-container>
              <label>Title</label>
              <md-input v-model="blogTitle"></md-input>
            </md-input-container>
            <md-input-container>
              <label>Content</label>
              <md-textarea v-model="blogContent" id="blogEditor"></md-textarea>
            </md-input-container>
            <div>
              <md-radio v-model="blogPublishStatus" id="blogPublish1" name="blogPublish" md-value="publish">Publish</md-radio>
              <md-radio v-model="blogPublishStatus" id="blogPublish2" name="blogPublish" md-value="draft">Save as draft</md-radio>
            </div>
            <md-card-actions>
              <md-button class="md-raised" @click="$refs.blogPreviewFrame.open()">Preview</md-button>
              <md-button @click="onSubmitBlog()">Submit</md-button>
            </md-card-actions>
          </md-card>
        </md-layout>
      </md-layout>

      <!-- USER CONTROL FRAME -->
      <md-layout id="admin-users-container" v-if="(User.access.admin.super || User.access.admin.moderator) && showPanel=='users'">
        <md-layout class="md-left" md-flex="15">
          <md-list class="md-double-line">
            <md-list-item @click="LoadUserPanel('subs')" v-bind:class="{selected: (userPanel === 'subs')}">
              <div class="md-list-text-container">
                <span>Subscribers</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadUserPanel('distinguished')" v-bind:class="{selected: (userPanel === 'distinguished')}">
              <div class="md-list-text-container">
                <span>Distinguished</span>
              </div>
            </md-list-item>
            <md-list-item>
              <md-input-container id="searchUserName">
                <md-autocomplete v-model="searchUserName" @selected="viewUser" :fetch="autoCompleteUserName" placeholder="Search Users"></md-autocomplete>
              </md-input-container>
            </md-list-item>
            <md-list-item v-if="selectedUser && selectedUser.account" @click="LoadUserPanel('selected')" v-bind:class="{selected: (userPanel === 'selected')}">
              <div class="md-list-text-container">
                <span>{{ selectedUser.account.username }}</span>
              </div>
            </md-list-item>
          </md-list>
        </md-layout>
        <md-layout md-flex="85">
          <md-card v-if="userPanel === 'wait'">
            <ui-loading></ui-loading>
          </md-card>
          <md-card v-if="userPanel === 'selected'" class="view-user">
            <ui-loading v-if="!selectedUser"></ui-loading>
            <div v-else>
              <div>
                <md-avatar>
                  <ui-image v-if="selectedUser.profile" :img="selectedUser.profile.avatar"></ui-image>
                </md-avatar>
                <span class="md-list-item-text" style="font-size:150%; font-weight: bold; margin-left: 8px;">{{ selectedUser.account.username }}</span>
                <small style="opacity:.6; margin-left: 8px">{{ selectedUser._id }}</small>
              </div>
              <md-layout>
                <md-list class="md-double-line">
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span>Account created</span>
                      <span>{{ selectedUser.account.created }}</span>
                    </div>
                  </md-list-item>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span>Profile</span>
                      <span v-if="selectedUser.account.hidden">Hidden</span>
                      <span v-else><a :href="'/p/' + selectedUser.account.username" target="_blank">View</a></span>
                    </div>
                  </md-list-item>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span>Verified Human/Anti Spam</span>
                      <span v-if="selectedUser.account.verified_human"><md-checkbox v-model="selectedUser.account.verified_human" class="md-primary" disabled>Verified</md-checkbox></span>
                      <span v-else><md-checkbox v-model="selectedUser.account.verified_human" @change="setAsHuman(selectedUser._id)" class="md-primary" >Not Verified</md-checkbox></span>
                    </div>
                  </md-list-item>
                  <md-list-item v-if="selectedUser.battlenet && selectedUser.battlenet.name">
                    <div class="md-list-text-container">
                      <span>Battle.net</span>
                      <span>{{ selectedUser.battlenet.name }}</span>
                    </div>
                  </md-list-item>
                  <md-list-item v-if="selectedUser.discord">
                    <div class="md-list-text-container">
                      <span>Discord</span>
                      <span>{{ selectedUser.discord.name }}</span>
                    </div>
                  </md-list-item>
                  <md-list-item v-if="selectedUser.google">
                    <div class="md-list-text-container">
                      <span>Google</span>
                      <span>{{ selectedUser.google.name }}</span>
                    </div>
                  </md-list-item>
                  <md-list-item v-if="selectedUser.patreon">
                    <div class="md-list-text-container">
                      <span>Patreon</span>
                      <span>{{ selectedUser.patreon.name }}</span>
                    </div>
                  </md-list-item>
                  <md-list-item v-if="selectedUser.twitter">
                    <div class="md-list-text-container">
                      <span>Twitter</span>
                      <span>{{ selectedUser.twitter.name }}</span>
                    </div>
                  </md-list-item>
                </md-list>
                <md-list>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span>Support Key</span>
                      <span>{{ selectedUser.account.support_key || 'Not Created' }}</span>
                    </div>
                  </md-list-item>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span>Roles</span>
                    </div>
                  </md-list-item>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span><md-checkbox v-model="selectedUser.roles.subscriber" class="md-primary" disabled>Subscriber</md-checkbox></span>
                    </div>
                  </md-list-item>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span><md-checkbox v-model="selectedUser.roles.gold_subscriber" class="md-primary" disabled>Gold Subscriber</md-checkbox></span>
                    </div>
                  </md-list-item>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span><md-checkbox v-model="selectedUser.roles.methodRaider" class="md-primary" disabled>Method Raider</md-checkbox></span>
                    </div>
                  </md-list-item>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span><md-checkbox v-model="selectedUser.roles.ambassador" @change="setUserRole('ambassador', selectedUser._id)" class="md-primary" :disabled="!User.access.admin.super">Ambassador</md-checkbox></span>
                    </div>
                  </md-list-item>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span><md-checkbox v-model="selectedUser.roles.methodStreamer" @change="setUserRole('methodStreamer', selectedUser._id)" class="md-primary" :disabled="!User.access.admin.super">Method Streamer</md-checkbox></span>
                    </div>
                  </md-list-item>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span><md-checkbox v-model="selectedUser.roles.community_leader" @change="setUserRole('community_leader', selectedUser._id)" class="md-primary" :disabled="!User.access.admin.super">Community Leader</md-checkbox></span>
                    </div>
                  </md-list-item>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span><md-checkbox v-model="selectedUser.roles.developer" @change="setUserRole('developer', selectedUser._id)" class="md-primary" :disabled="!User.access.admin.super">Addon Developer</md-checkbox></span>
                    </div>
                  </md-list-item>
                  <md-list-item>
                    <div class="md-list-text-container">
                      <span><md-checkbox v-model="selectedUser.roles.artContestWinnerAug2018" class="md-primary" disabled>Art Contest Winner [August 2018]</md-checkbox></span>
                    </div>
                  </md-list-item>
                </md-list>
                <div v-if="selectedUser.roles.isAdmin && selectedUser.roles.isAdmin.access">
                  <md-list>
                    <md-list-item>
                      <div class="md-list-text-container">
                        <span>Admin</span>
                      </div>
                    </md-list-item>
                    <md-list-item>
                      <div class="md-list-text-container">
                        <span><md-checkbox v-model="selectedUser.roles.isAdmin.super" class="md-primary" disabled>Super Admin</md-checkbox></span>
                      </div>
                    </md-list-item>
                    <md-list-item>
                      <div class="md-list-text-container">
                        <span><md-checkbox v-model="selectedUser.roles.isAdmin.blog" class="md-primary" disabled>Blog Posts</md-checkbox></span>
                      </div>
                    </md-list-item>
                    <md-list-item>
                      <div class="md-list-text-container">
                        <span><md-checkbox v-model="selectedUser.roles.isAdmin.moderator" class="md-primary" disabled>User Moderator</md-checkbox></span>
                      </div>
                    </md-list-item>
                    <md-list-item>
                      <div class="md-list-text-container">
                        <span>Site Config</span>
                      </div>
                    </md-list-item>
                    <md-list-item>
                      <span><md-checkbox v-model="selectedUser.roles.isAdmin.config.embed" class="md-primary" disabled>Stream Embed</md-checkbox></span>
                    </md-list-item>
                  </md-list>
                </div>
              </md-layout>
            </div>
          </md-card>
          <md-card v-if="userPanel === 'subs'">
            <md-layout v-if="userList && userList.gold" class="sublist">
              <h2 class="user-goldsub">Gold Subscribers</h2>
              <template v-for="user of userList.gold">
                <div v-if="user.account.username" @click="viewUser(user)">
                  <md-avatar>
                    <ui-image v-if="user.profile" :img="user.profile.avatar"></ui-image>
                  </md-avatar>
                  <span class="md-list-item-text user-goldsub">{{ user.account.username }}</span>
                </div>
              </template>
              <h2 class="user-sub">Subscribers</h2>
              <template v-for="user of userList.subs">
                <div v-if="user.account.username" @click="viewUser(user)">
                  <md-avatar v-if="user.profile">
                    <ui-image v-if="user.profile" :img="user.profile.avatar"></ui-image>
                  </md-avatar>
                  <span class="md-list-item-text user-sub">{{ user.account.username }}</span>
                </div>
              </template>
            </md-layout>
          </md-card>
          <md-card v-else-if="userPanel === 'distinguished'">
            <md-layout v-if="userList && userList.admin && userList.admin.length" class="sublist">
              <h2 class="user-admin">Admins</h2>
              <template v-for="user of userList.admin">
                <div v-if="user.account.username" @click="viewUser(user)">
                  <md-avatar>
                    <ui-image v-if="user.profile" :img="user.profile.avatar"></ui-image>
                  </md-avatar>
                  <span class="md-list-item-text user-admin">{{ user.account.username }}</span>
                </div>
              </template>
            </md-layout>
            <md-layout v-if="userList && userList.methodStreamer && userList.methodStreamer.length" class="sublist">
              <h2 class="user-method">Method Streamers</h2>
              <template v-for="user of userList.methodStreamer">
                <div v-if="user.account.username" @click="viewUser(user)">
                  <md-avatar>
                    <ui-image v-if="user.profile" :img="user.profile.avatar"></ui-image>
                  </md-avatar>
                  <span class="md-list-item-text user-method">{{ user.account.username }}</span>
                </div>
              </template>
            </md-layout>
            <md-layout v-if="userList && userList.methodRaider && userList.methodRaider.length" class="sublist">
              <h2 class="user-method">Method Raid Team</h2>
              <template v-for="user of userList.methodRaider">
                <div v-if="user.account.username" @click="viewUser(user)">
                  <md-avatar v-if="user.profile">
                    <ui-image v-if="user.profile" :img="user.profile.avatar"></ui-image>
                  </md-avatar>
                  <span class="md-list-item-text user-method">{{ user.account.username }}</span>
                </div>
              </template>
            </md-layout>
            <md-layout v-if="userList && userList.ambassador && userList.ambassador.length" class="sublist">
              <h2 class="user-goldsub">Wago Ambassadors</h2>
              <template v-for="user of userList.ambassador">
                <div v-if="user.account.username" @click="viewUser(user)">
                  <md-avatar v-if="user.profile">
                    <ui-image v-if="user.profile" :img="user.profile.avatar"></ui-image>
                  </md-avatar>
                  <span class="md-list-item-text user-goldsub">{{ user.account.username }}</span>
                </div>
              </template>
            </md-layout>
            <md-layout v-if="userList && userList.communityLeader && userList.communityLeader.length" class="sublist">
              <h2 class="user-goldsub">Community Leaders</h2>
              <template v-for="user of userList.communityLeader">
                <div v-if="user.account.username" @click="viewUser(user)">
                  <md-avatar v-if="user.profile">
                    <ui-image v-if="user.profile" :img="user.profile.avatar"></ui-image>
                  </md-avatar>
                  <span class="md-list-item-text user-goldsub">{{ user.account.username }}</span>
                </div>
              </template>
            </md-layout>
            <md-layout v-if="userList && userList.developer && userList.developer.length" class="sublist">
              <h2 class="user-goldsub">Addon Developers</h2>
              <template v-for="user of userList.developer">
                <div v-if="user.account.username" @click="viewUser(user)">
                  <md-avatar v-if="user.profile">
                    <ui-image v-if="user.profile" :img="user.profile.avatar"></ui-image>
                  </md-avatar>
                  <span class="md-list-item-text user-goldsub">{{ user.account.username }}</span>
                </div>
              </template>
            </md-layout>
            <md-layout v-if="userList && userList.contestWinner && userList.contestWinner.length" class="sublist">
              <h2 class="user-goldsub">Contest Winners</h2>
              <template v-for="user of userList.contestWinner">
                <div v-if="user.account.username" @click="viewUser(user)">
                  <md-avatar v-if="user.profile">
                    <ui-image v-if="user.profile" :img="user.profile.avatar"></ui-image>
                  </md-avatar>
                  <span class="md-list-item-text user-goldsub">{{ user.account.username }}</span>
                </div>
              </template>
            </md-layout>
          </md-card>
        </md-layout>
      </md-layout>

      <!-- ADVERTISING FRAME -->
      <md-layout id="admin-advert-container" v-if="(User.access.admin.super || User.access.admin.config?.embed) && showPanel=='sitecfg'">
        <md-layout class="md-left" md-flex="15">
          <md-list class="md-double-line">
            <md-list-item @click="LoadAdvertConfig('streams')" v-bind:class="{selected: (siteConfigPanel === 'streams')}">
              <div class="md-list-text-container"><span>Embedded Stream</span></div>
            </md-list-item>
            <md-list-item @click="LoadAdvertConfig('streamstats')" v-bind:class="{selected: (siteConfigPanel === 'streamstats')}">
              <div class="md-list-text-container"><span>Stream Stats</span></div>
            </md-list-item>
          </md-list>
        </md-layout>
        <template v-if="siteConfigPanel === 'streamstats'">
          <div style="padding-left:16px">
            <p><span style="border-bottom: 1px solid #555">Total Users on Site: <strong>{{ activeUserCount.total || 0 }}</strong></span><br>
              Premium Users on Site: <strong>{{ activeUserCount.subs || 0 }}</strong><br>
              Active Streams: <strong>{{ activeUserCount.viewing || 0 }}</strong><br>
              Stale Streams: <strong>{{ activeUserCount.stale || 0 }}</strong><br>
              Streamspread Streams: <strong>{{ activeUserCount.streamspread || 0 }}</strong><br>
              Closed Streams: <strong>{{ activeUserCount.closed || 0 }}</strong><br>
            </p>
            <md-table>
              <md-table-header>
                <md-table-row>
                  <md-table-head>Name</md-table-head>
                  <md-table-head>Online</md-table-head>
                  <md-table-head md-numeric md-tooltip="Excluding embbed streams from Wago">Twitch Viewers</md-table-head>
                  <md-table-head md-numeric>Wago Viewers</md-table-head>
                  <md-table-head>Weighting</md-table-head>
                </md-table-row>
              </md-table-header>
              <md-table-body>
                <md-table-row v-for="(row, index) in streamerList" :key="index">
                  <md-table-cell><strong>{{ row.name }}</strong><br>{{ row.game }}</md-table-cell>
                  <md-table-cell v-if="row.online"><span style="color:#00e600">Online</span><br>{{ calcOnlineDuration(row.online) }}</md-table-cell>
                  <md-table-cell v-else><span style="color:grey">Offline<br>{{ calcOnlineDuration(row.offline) }}</span></md-table-cell>
                  <md-table-cell>{{ row.viewers || 0 }}</md-table-cell>
                  <md-table-cell>{{ row.wagoViewers || 0 }}</md-table-cell>
                  <md-table-cell>{{ calcWagoWeighting(row) }}%</md-table-cell>
                  <md-table-cell><md-button class="md-icon-button md-raised" @click="deleteStreamer(index)"><md-icon>delete</md-icon></md-button></md-table-cell>
                </md-table-row>
              </md-table-body>
            </md-table>
            <form @submit="addStreamer">
              <md-card id="add-streamer">
                <strong>Add Streamer:</strong>
                <md-input-container>
                  <label>https://twitch.tv/...</label>
                  <md-input v-model="addStreamerName"></md-input>
                </md-input-container>
                <md-card-actions style="justify-content: space-between">
                  <md-button class="md-raised" @click="addStreamer">Add streamer</md-button>
                </md-card-actions>
              </md-card>
            </form>
          </div>
        </template>
        <template v-if="siteConfigPanel === 'streams'">
          <md-layout>
            <md-card>
              <md-card-content>
                <md-checkbox v-model="streamConfig.streamspread"><strong style="color:white">Enable StreamSpread as default</strong></md-checkbox><br>
                <md-checkbox v-model="streamConfig.enabled"><strong style="color:white">Enable Twitch Override</strong></md-checkbox>
              </md-card-content>
              <div v-if="streamConfig.enabled" v-for="(stream, index) of streamConfig.streams" style="border: 1px solid #666; margin-bottom: 16px; position: relative">
                <md-button class="md-icon-button md-raised" style="position: absolute; top: calc(50% - 16px); right: 8px;" @click="deleteStream(index)"><md-icon>delete</md-icon></md-button>
                <md-card-content>
                  <strong>Stream Channel:</strong>
                  <md-input-container>
                    <label>https://twitch.tv/...</label>
                    <md-autocomplete v-model="stream.channel" :list="commonChannels" :min-chars="0" :max-height="6" :debounce="500" @input="stream.unknown=1"></md-autocomplete>
                  </md-input-container>
                  <strong>Exposure of <em>{{ stream.channel }}</em> Stream: {{ stream.exposure }}%</strong>
                  <vue-slider v-model="stream.exposure" :width="200" tooltip="none"></vue-slider>
                </md-card-content>
                <md-card-content>
                  <strong>Status:</strong>
                  <span v-if="stream.unknown">Save config to update status</span>
                  <template v-else>
                    <span v-if="stream.online" style="color:#00c500">[Online]</span>
                    <span v-else style="color:#bf0000">[Offline]</span>
                    Currently Viewing <em>{{ stream.channel }}</em> Stream: <strong>{{ countViewers(stream.channel) }}</strong>
                  </template>
                </md-card-content>
                <md-card-content>
                  <strong>Max number of active <em>{{ stream.channel }}</em> Streams before moving to next stream:</strong>
                  <md-input-container class="move-field-up">
                    <md-input v-model="stream.max" type="number"></md-input>
                  </md-input-container>
                </md-card-content>
              </div>
              <md-card-actions style="justify-content: space-between">
                <md-button class="md-raised" @click="addStream()">Add new stream</md-button>
                <md-button class="md-raised" style="justify-self: flex-start" @click="saveStreamConfig()">Save Stream Config</md-button>
              </md-card-actions>
            </md-card>
          </md-layout>
          <md-layout>
            <md-card>
              <md-card-header><div style="margin-bottom:62px">Embed Preview</div></md-card-header>
              <div v-if="streamConfig.enabled" v-for="(stream, index) of streamConfig.streams" style="margin: 0 0 36px 16px">
                <stream-embed v-if="stream.channel" :stream="stream.channel" :preview="true" />
              </div>
            </md-card>
          </md-layout>
        </template>
      </md-layout>

      <!-- STATUS FRAME -->
      <md-layout id="admin-blog-container" v-if="(User.access.admin.super) && showPanel=='status'">
        <md-layout class="md-left" ref="blogSidebar" id="blog-sidebar" md-flex="15">
          <md-list class="md-double-line">
            <md-list-item @click="LoadStatus('requests')" v-bind:class="{selected: (statusSelected === 'requests')}">
              <div class="md-list-text-container">
                <span>Requests</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadStatus('dataservers')" v-bind:class="{selected: (statusSelected === 'dataservers')}">
              <div class="md-list-text-container">
                <span>Data Servers</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadStatus('redis')" v-bind:class="{selected: (statusSelected === 'redis')}">
              <div class="md-list-text-container">
                <span>Redis</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadStatus('waiting')" v-bind:class="{selected: (statusSelected === 'waiting')}">
              <div class="md-list-text-container">
                <span>Waiting Tasks</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadStatus('active')" v-bind:class="{selected: (statusSelected === 'active')}">
              <div class="md-list-text-container">
                <span>Active Tasks</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadStatus('completed')" v-bind:class="{selected: (statusSelected === 'completed')}">
              <div class="md-list-text-container">
                <span>Completed Tasks</span>
              </div>
            </md-list-item>
            <!--<md-list-item @click="LoadStatus('ratelimit')" v-bind:class="{selected: (statusSelected === 'ratelimit')}">
              <div class="md-list-text-container">
                <span>Rate Limits</span>
              </div>
            </md-list-item>-->
          </md-list>
        </md-layout>
        <md-layout md-flex="85">
          <md-layout md-col v-if="statusSelected === 'redis'">
            <form novalidate @submit.stop.prevent="submitRedisSearch" style="width:100%">
              <div style="width:300px">
                <md-input-container>
                  <label for="advSearchType">{{ $t("Select Server") }}</label>
                  <md-select v-model="redisServer" @change="loadRedisInfo">
                    <md-option value="cache">1. Cache</md-option>
                    <md-option value="rate">2. Rate/User</md-option>
                  </md-select>
                </md-input-container>
              </div>
              <md-layout>
                <div style="width:300px">
                  <md-input-container>
                    <label>Key Search</label>
                    <md-input v-model="redisKeySearch"></md-input>
                  </md-input-container>
                </div>
                <md-button v-if="redisValue && redisValue !== 'null' && redisKeySearch" class="md-primary" @click="deleteRedisKey()">Delete Key</md-button>
              </md-layout>
            </form>
            <editor v-model="redisValue" @init="editorInit" v-if="redisValue" :theme="$store.state.user.config.editor" lang="json" width="100%" height="30"></editor>
            <h4>Redis.info()</h4>
            <editor v-model="statusJSON" @init="editorInit" :theme="$store.state.user.config.editor" lang="json" width="100%" height="500"></editor>
          </md-layout>
          <form novalidate @submit.stop.prevent="submitRateLimit" v-if="statusSelected === 'ratelimit'" style="width:300px">
            <md-input-container>
              <label>IP Search</label>
              <md-input v-model="rateLimitSearch"></md-input>
            </md-input-container>
          </form>
          <editor v-if="statusSelected.match(/waiting|active|completed|ratelimit/)" v-model="statusJSON" @init="editorInit" :theme="$store.state.user.config.editor" lang="json" width="100%" height="500"></editor>
          <md-table-card v-else-if="statusSelected === 'requests'">
            <md-table md-sort="timestamp" md-sort-type="desc" @sort="sortRequests">
              <md-table-header>
                <md-table-row>
                  <md-table-head md-sort-by="timestamp">Time</md-table-head>
                  <md-table-head md-sort-by="status">Status</md-table-head>
                  <md-table-head md-sort-by="method">Method</md-table-head>
                  <md-table-head md-sort-by="host">Host</md-table-head>
                  <md-table-head md-sort-by="path">Path</md-table-head>
                  <md-table-head md-sort-by="elapsed" md-numeric>Elapsed</md-table-head>
                </md-table-row>
              </md-table-header>

              <md-table-body>
                <md-table-row v-for="(row, rowIndex) in requestTable[requestPage]" :key="rowIndex" :md-item="row">
                  <md-table-cell>{{ row.timestamp | moment('HH:mm.SSS MMM Do YYYY') }}</md-table-cell>
                  <md-table-cell>{{ row.statusCode || 'Processing' }}</md-table-cell>
                  <md-table-cell>{{ row.method }}</md-table-cell>
                  <md-table-cell>{{ row.host }}</md-table-cell>
                  <md-table-cell>{{ row.route }}</md-table-cell>
                  <md-table-cell md-numeric>{{ row.elapsed }}ms</md-table-cell>
                </md-table-row>
              </md-table-body>
            </md-table>

            <md-table-pagination
              md-size="100"
              md-total="1000"
              md-page="1"
              md-label="Rows"
              md-separator="of"
              @page="setPage"></md-table-pagination>
          </md-table-card>
          <md-table-card v-else-if="statusSelected === 'dataservers'">
            <md-table>
              <md-table-header>
                <md-table-row>
                  <md-table-head>Server</md-table-head>
                  <md-table-head md-numeric>Response time last 5 min</md-table-head>
                  <md-table-head md-numeric>Last 15 min</md-table-head>
                  <md-table-head md-numeric>Last hour</md-table-head>
                </md-table-row>
              </md-table-header>

              <md-table-body>
                <md-table-row v-for="(times, host) in hostStatus" :key="k">
                  <md-table-cell>{{ host }}</md-table-cell>
                  <md-table-cell md-numeric>{{ Math.round(times[0]) }}ms</md-table-cell>
                  <md-table-cell md-numeric>{{ Math.round(times[1]) }}ms</md-table-cell>
                  <md-table-cell md-numeric>{{ Math.round(times[2]) }}ms</md-table-cell>
                </md-table-row>
              </md-table-body>
            </md-table>
          </md-table-card>
        </md-layout>
      </md-layout>

      <md-dialog ref="blogPreviewFrame" id="adminPreviewFrame">
        <md-dialog-title>Preview Content</md-dialog-title>
        <md-dialog-content>
          <vue-markdown :source="blogContent"></vue-markdown>
        </md-dialog-content>
        <md-dialog-actions>
          <md-button class="md-primary" @click="$refs.blogPreviewFrame.close()">Ok</md-button>
        </md-dialog-actions>
      </md-dialog>
    </div>
    <ui-warning v-else mode="alert">No access to this page.</ui-warning>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/material.css'
import StreamEmbed from '../UI/StreamEmbed.vue'

export default {
  components: {
    editor: require('vue2-ace-editor'),
    'vue-markdown': VueMarkdown,
    VueSlider: VueSlider,
    StreamEmbed: StreamEmbed
  },
  data: function () {
    return {
      showPanel: '',
      blogs: [],
      blogTitle: '',
      blogContent: '',
      blogPublishStatus: 'draft',
      blogSelected: -1,
      blogID: '',
      statusSelected: 'requests',
      status: {redis: ''},
      statusJSON: '',
      requestTable: [],
      requestPage: 0,
      hostStatus: {},
      rateLimitSearch: '',

      userPanel: 'wait',
      userList: {},
      searchUserName: '',
      selectedUser: null,

      redisServer: 'cache',
      redisKeySearch: '',
      redisValue: '',

      siteConfigPanel: 'streams',
      streamConfig: {},
      commonChannels: [{name:'Method'}, {name:'Sco'}],
      activeUserCount: {},
      streamerList: [],
      addStreamerName: '',
      streamerUpdateInterval: null,
      timeFormat: new Intl.RelativeTimeFormat('en', {
        numeric: 'always',
        style: 'long'
      })
    }
  },
  mounted: function () {
    const p = async () => {
      if (!this.User || !this.User.access || !this.User.access.admin) {
        setTimeout(p, 100)
        return
      }
      if (this.User.access.admin.super || this.User.access.admin.config?.embed) {
        this.toggleFrame('sitecfg')
      }
      else if (this.User.access.admin.blog) {
        this.toggleFrame('blogpost')
      }
      else if (this.User.access.admin.moderator) {
        this.toggleFrame('users')
      }

      if (this.User.access.admin.super || this.User.access.admin.config?.embed) {
        let data = await this.http.get('/admin/getstreamers')
        this.streamerList = data.streams
        this.activeUserCount = data.users
        this.streamerUpdateInterval = setInterval(async () => {
          let data = await this.http.get('/admin/getstreamers')
          this.streamerList = data.streams
          this.activeUserCount = data.users
        }, 5000)
      }
    }
    p()
  },
  destroyed: function () {
    clearInterval(this.streamerUpdateInterval)
  },
  computed: {
    User () {
      return this.$store.state.user
    }
  },
  methods: {
    countViewers (channel) {
      for (let i = 0; i < this.streamerList.length; i++) {
        if (this.streamerList[i].name === channel) {
          return this.streamerList[i].wagoViewers
        }
      }
    },
    LoadBlog (index) {
      if (index === -1) {
        this.blogTitle = ''
        this.blogContent = ''
        this.blogPublishStatus = 'draft'
        this.blogSelected = index
        this.blogID = false
      }
      else {
        var vue = this
        vue.http.get('/lookup/blog', {
          id: vue.blogs[index]._id
        }).then((res) => {
          if (res._id) {
            vue.blogTitle = res.title
            vue.blogContent = res.content
            vue.blogPublishStatus = res.publishStatus
            vue.blogSelected = index
            vue.blogID = res._id
          }
        })
      }
    },

    LoadAdvertConfig: async function (panel) {
      this.siteConfigPanel = panel
    },

    LoadUserPanel: async function (panel) {
      if (!this.userList.subs) {
        this.userList = await this.http.get('/admin/getusers')
      }

      this.userPanel = panel
    },
    autoCompleteUserName: function (q) {
      return this.http.get('/admin/search-username', {name: q.q})
    },
    viewUser: async function (user) {
      if (!user) {
        return
      }
      this.selectedUser = null
      this.LoadUserPanel('selected')
      this.selectedUser = await this.http.get('/admin/get-user', {user: user._id})
      this.searchUserName = ''
    },
    setAsHuman: async function (user_id) {
      await this.http.post('/admin/verify-human-user', {user: user_id})
    },
    ping: async function (ip) {
      return 0
    },
    setUserRole: async function (role, user_id) {
      this.$nextTick(async function() {
        await this.http.post('/admin/set-user-role', {role: role, user: user_id, value: this.selectedUser.roles[role]})
        if (this.selectedUser.roles[role]) {
          this.userList[role].push(this.selectedUser)
        }
        else {
          this.$set(this.userList, role, this.userList[role].filter(u => {return u._id !== user_id}))
        }
      })
    },

    editorInit: function (editor) {
      window.braceRequires()
      editor.setOptions({
        autoScrollEditorIntoView: true,
        scrollPastEnd: true,
        printMargin: false,
        minLines: 20,
        maxLines: 1000
      })
    },

    LoadStatus: async function (frame) {
      this.statusSelected = frame
      if (frame === 'dataservers') {
        this.hostStatus = await this.http.get('/admin/data-servers')
      }
      else if (frame === 'ratelimit') {
        this.status.ratelimit = await this.http.get('/admin/ratelimit')
      }
      else if (frame === 'redis') {
        this.loadRedisInfo()
        return
      }
      this.statusJSON = JSON.stringify(this.status[frame], null, 2)
    },

    onSubmitBlog () {
      var blog = {
        title: this.blogTitle,
        publishStatus: this.blogPublishStatus,
        content: this.blogContent,
        id: this.blogID
      }
      var vue = this
      this.http.post('/admin/blog', blog).then((res) => {
        if (res.success && vue.blogSelected > -1) {
          vue.blogs.splice(vue.blogSelected, 1, res.blog)
        }
        else {
          vue.blogs.unshift(res.blog)
          vue.blogSelected = 0
        }
      })
    },

    async submitRateLimit () {
      this.status.ratelimit = await this.http.get('/admin/ratelimit', {q: this.rateLimitSearch})
      this.statusJSON = JSON.stringify(this.status.ratelimit, null, 2)
    },

    toggleFrame (frame) {
      this.showPanel = frame
      var vue = this
      if (frame === 'blogpost') {
        this.http.get('/admin/blogs').then((res) => {
          if (res.blogs) {
            res.blogs.forEach((b) => {
              vue.blogs.push(b)
            })
          }
        })
      }
      else if (frame === 'sitecfg') {
        this.http.get('/admin/stream').then((res) => {
          this.streamConfig = res
        })
      }
      else if (frame === 'users') {
        this.LoadUserPanel('subs')
      }
      else if (frame === 'status') {
        this.http.get('/admin/tasks').then((res) => {
          this.statusJSON = res.redis
          vue.status = res
          vue.requestTable = []
          vue.requestTable[0] = res.profiler.slice(1, 100)
          vue.requestTable[1] = res.profiler.slice(100, 200)
          vue.requestTable[2] = res.profiler.slice(200, 300)
          vue.requestTable[3] = res.profiler.slice(300, 400)
          vue.requestTable[4] = res.profiler.slice(400, 500)
          vue.requestTable[5] = res.profiler.slice(500, 600)
          vue.requestTable[6] = res.profiler.slice(600, 700)
          vue.requestTable[7] = res.profiler.slice(700, 800)
          vue.requestTable[8] = res.profiler.slice(800, 900)
          vue.requestTable[9] = res.profiler.slice(900, 1000)
        })
      }
    },
    sortRequests (sort) {
      console.log(sort)
    },
    setPage (page) {
      this.requestPage = page - 1
    },
    addStream () {
      this.streamConfig.streams.push({
        unknown: 1,
        channel: 'method',
        exposure: 50,
        embedViewers: 0,
        max: 100
      })
    },
    deleteStream (index) {
      this.streamConfig.streams.splice(index, 1)
    },
    async addStreamer (e) {
      e.preventDefault()
      if (this.addStreamerName.trim()) {
        const res = await this.http.post('/admin/streamer/add', {name: this.addStreamerName})
        if (res && res.success) {
          this.streamerList.push({name: this.addStreamerName, game: 'Pending update', viewers: 0, wagoViewers: 0})
          this.addStreamerName = ''
        }
        else if (res && res.error) {
          window.eventHub.$emit('showSnackBar', res.error)
        }
        else {
          window.eventHub.$emit('showSnackBar', i18next.t('An error has occurred'))
        }
      }
    },
    async deleteStreamer (index) {
      const res = await this.http.post('/admin/streamer/delete', {id: this.streamerList[index]._id})
      if (res && res.success) {
        this.streamerList.splice(index, 1)
      }
    },
    calcOnlineDuration (date) {
      if (!date) {
        return ''
      }
      const t = (new Date(date)).getTime()
      const now = (new Date()).getTime()
      const seconds = (t - now) / 1000
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always', style: 'long' })
      if (seconds > 60) {
        return rtf.format(seconds, 'second').replace(/ ago/, '')
      }
      else if (seconds > 3600) {
        return rtf.format(Math.round(seconds / 3600 * 10) / 10, 'minutes').replace(/ ago/, '')
      }
      return rtf.format(Math.round(seconds / 3600 * 10) / 10, 'hour').replace(/ ago/, '')
    },
    calcWagoWeighting (st) {
      const total = this.streamerList.map(c => c.viewers || 0).reduce((acc, cur) => acc + cur)
      return (Math.round(st.viewers / total * 1000) / 10) || 0
    },
    saveStreamConfig () {
      this.streamConfig.streams.forEach((st, i) => {
        if (st.channel.toLowerCase() === 'sco') {
          this.$set(this.streamConfig.streams[i], 'channel', 'Sco')
        }
        else if (st.channel.toLowerCase() === 'method') {
          this.$set(this.streamConfig.streams[i], 'channel', 'Method')
        }
      })
      this.http.post('/admin/stream', {enabled: this.streamConfig.enabled, streams: this.streamConfig.streams, streamspread: this.streamConfig.streamspread}).then((res) => {

        if (res.success) {
          window.eventHub.$emit('showSnackBar', 'Stream settings saved.')
          this.streamConfig = res
        }
        else {
          window.eventHub.$emit('showSnackBar', 'Error could not save.')
        }
      })
    },

    async submitRedisSearch () {
      if (!this.redisKeySearch) {
        this.redisValue = 'null'
        return
      }
      var res = await this.http.post('/admin/redis/get', {
        server: this.redisServer,
        key: this.redisKeySearch
      })
      if (res && res.value) {
        try {
          let json = JSON.stringify(res, null, 2)
          this.redisValue = json
        }
        catch (e) {
          console.log(e)
          // not a json string
        }
      }
      else {
        this.redisValue = 'null'
      }
    },

    async loadRedisInfo () {
      var info = await this.http.post('/admin/redis/info', {server: this.redisServer})
      this.statusJSON = info.info || info.error
    },

    async deleteRedisKey () {
      var res = await this.http.post('/admin/redis/delete', {
        server: this.redisServer,
        key: this.redisKeySearch
      })
      if (res.success) {
        this.redisValue = this.redisKeySearch + ' <DELETED>'
      }
    }
  }
}
</script>

<style>
.md-flex-15 ul {width: 100%}
#admin .md-button-toggle { padding: 16px}
#admin .md-card {width: 100%}
#admin .md-list-item.selected { background: rgba(0, 0, 0, .7)}
#admin #blog-sidebar ul { width: 100% }
#admin #blog-sidebar ul em { font-size: 80%; opacity: .8 }
#adminPreviewFrame .md-dialog p { margin: 12px 0}
#blogEditor { min-height: 600px }
.md-table-cell-container {white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}

.md-table .md-table-cell.md-numeric .md-table-cell-container {justify-content: flex-end}

.move-field-up {margin: 0; padding-top: 0; min-height: auto;}
#admin-advert-container .md-card-content {max-width: 525px}
.vue-slider-process {background-color: #D1575D}
.vue-slider-rail {background-color: #D1575D}
.vue-slider-dot-handle {background-color: #C1272D}
.vue-slider-dot-handle::after {background-color: #C1272D55}
.vue-slider-disabled .vue-slider-rail {background:#666}

.sublist > div {margin: 0 12px 12px 0; padding: 4px; min-width: 170px; background: #FFFFFF11}
.sublist > h2 {width: 100%}
.sublist > div:hover {cursor: pointer; background: #FFFFFF22}
.view-user .md-checkbox {margin: 0}
.view-user .md-list {margin-right: 16px}
.view-user .md-list:after {background-color: transparent!important}

#add-streamer {margin-left:0}
</style>
