from rest_framework import serializers
from django.contrib.auth import get_user_model
import secrets
import string

Users = get_user_model()

class ForgotPasswordSerializer(serializers.Serializer):
    """
    Serializer for handling forgot password requests
    """
    email = serializers.EmailField()

    def validate_email(self, value):
        """
        Check if the email exists in the database
        """
        if not Users.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user is registered with this email address.")
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for validating password reset tokens and setting new password
    """
    token = serializers.CharField()
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True, required=False)

    def validate(self, data):
        """
        Check that the passwords match if confirm_password was provided
        """
        # Only validate matching passwords if confirm_password is included in request
        if 'confirm_password' in data and data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"error": "Password fields didn't match."})
        return data