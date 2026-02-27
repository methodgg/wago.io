<template>
    <div id="notice-blur" v-if="!hideAlert">
        <div id="notice-content">
            <p>27th February 2026</p>
            <h3>Important Security Notice: Incident Affecting Wago.io Accounts</h3>

            <div>
                <p>We recently identified unauthorised access affecting some Wago.io account information. Following an investigation we have secured the affected systems.</p>
                <p>If you have a Wago.io account, please review important information about what this means for your account. <span id="notice-link" @click="handleLinkClick">Read full notice here</span></p>
            </div>

            <div class="dialog-actions">
                <md-button class="md-primary" @click="closeAlert()">{{ $t("Close") }}</md-button>
            </div>
        </div>    
    </div>
</template>

<script>

export default {
    data: () => {
        return {
            hideAlert: document.cookie.split(';').some((item) => item.trim().startsWith('closeSecurityAlert=1')),
        }
    },
    methods: {
        closeAlert () {
            this.hideAlert = true;
            document.cookie = "closeSecurityAlert=1;path=/;domain=.wago.io;max-age=315360000";
        },
        handleLinkClick () {
            this.hideAlert = true;
            document.cookie = "closeSecurityAlert=1;path=/;domain=.wago.io;max-age=315360000";
            this.$router.push('/document/SecurityNotice-2026-02');
        }
    },
}
</script>

<style>
#notice-blur {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}
#notice-content{
    z-index: 1000;
    font-size: 15px;
    background-color: #000;
    border: 1px solid #ccc;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    max-width: 500px;
    width: 100vw;
    max-height: 100vh;
    button {
        border: 1px solid #ccc;
        margin: 0;
    }
}
#notice-link {
    color: #c1272d;
    text-decoration: underline;
    cursor: pointer;
}
@media (max-width: 960px) {
    #security-notice {
        position: fixed;
        top: 0;
        right: auto;
        left: 25vw;
        width: 75vw;
        max-width: 75vw;
        height: 100vh;
        padding: 10px;
    }
}
</style>
